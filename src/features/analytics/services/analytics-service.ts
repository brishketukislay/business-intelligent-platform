import {
  prisma,
} from "@/lib/prisma";

import {
  requireModelAccess,
} from "@/lib/model-access";

import {
  getFormulaIdentifiers,
  evaluateFormula,
} from "@/features/metrics/services/formula-engine";

import {
  getBusinessModels,
} from "@/features/models/services/model-service";

import type {
  AnalyticsChartConfig,
  AnalyticsChartRecord,
  AnalyticsDashboardData,
  AnalyticsModelData,
  AnalyticsPeriod,
  AnalyticsScenario,
  AnalyticsSource,
} from "../types";

type InputDefinition = {
  id: string;
  name: string;
  key: string;
  type: string;
  unit: string | null;
  category: string | null;
};

type MetricDefinition = {
  id: string;
  name: string;
  key: string;
  type: string;
  unit: string | null;
  category: string | null;
  formula: string;
};

type PeriodRecord = {
  id: string;
  name: string;
  key: string;
  sortOrder: number;
};

type ScenarioValueRecord = {
  scenarioId: string;
  inputId: string;
  periodId: string | null;
  value: string;
};

function numericValue(
  value: string | null | undefined
): number | undefined {
  if (
    value === null ||
    value === undefined ||
    value.trim() === ""
  ) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : undefined;
}

function sourceKey(
  kind: "input" | "metric",
  id: string
) {
  return `${kind}:${id}`;
}

function calculateMetricSeries(
  metrics: MetricDefinition[],
  periods: PeriodRecord[],
  inputVariablesByPeriod: Map<
    string,
    Record<string, number>
  >
): Map<string, Array<number | null>> {
  const metricByKey =
    new Map<string, MetricDefinition>();

  for (const metric of metrics) {
    metricByKey.set(
      metric.key,
      metric
    );
  }

  const calculated =
    new Map<
      string,
      Map<string, number>
    >();

  const calculating =
    new Set<string>();

  function calculateMetric(
    key: string,
    periodId: string
  ): number {
    let metricValues =
      calculated.get(key);

    if (!metricValues) {
      metricValues =
        new Map<string, number>();

      calculated.set(
        key,
        metricValues
      );
    }

    const cached =
      metricValues.get(periodId);

    if (cached !== undefined) {
      return cached;
    }

    const variablesForPeriod =
      inputVariablesByPeriod.get(
        periodId
      ) ?? {};

    const directInput =
      variablesForPeriod[key];

    if (directInput !== undefined) {
      return directInput;
    }

    const metric =
      metricByKey.get(key);

    if (!metric) {
      throw new Error(
        `Unknown input or metric "${key}".`
      );
    }

    const calculationKey =
      `${key}:${periodId}`;

    if (
      calculating.has(
        calculationKey
      )
    ) {
      throw new Error(
        `Circular metric dependency involving "${key}".`
      );
    }

    calculating.add(
      calculationKey
    );

    try {
      const variables:
        Record<string, number> = {};

      const identifiers =
        getFormulaIdentifiers(
          metric.formula
        );

      for (
        const identifier
        of identifiers
      ) {
        variables[identifier] =
          calculateMetric(
            identifier,
            periodId
          );
      }

      const currentPeriod =
        periods.find(
          period =>
            period.id ===
            periodId
        );

      if (!currentPeriod) {
        throw new Error(
          `Unknown model period "${periodId}".`
        );
      }

      const cumulative = (
        inputKey: string
      ): number => {
        let total = 0;

        for (
          const period
          of periods
        ) {
          if (
            period.sortOrder >
            currentPeriod.sortOrder
          ) {
            break;
          }

          const periodVariables =
            inputVariablesByPeriod.get(
              period.id
            ) ?? {};

          const direct =
            periodVariables[
              inputKey
            ];

          if (
            direct !== undefined
          ) {
            total += direct;
            continue;
          }

          if (
            metricByKey.has(
              inputKey
            )
          ) {
            total +=
              calculateMetric(
                inputKey,
                period.id
              );
          }
        }

        return total;
      };

      const result =
        evaluateFormula(
          metric.formula,
          variables,
          {
            CUMULATIVE:
              cumulative,
          }
        );

      if (
        !Number.isFinite(result)
      ) {
        throw new Error(
          `Metric "${metric.name}" produced an invalid result.`
        );
      }

      metricValues.set(
        periodId,
        result
      );

      return result;
    } finally {
      calculating.delete(
        calculationKey
      );
    }
  }

  const result =
    new Map<
      string,
      Array<number | null>
    >();

  for (const metric of metrics) {
    const values =
      periods.map(
        period => {
          try {
            return calculateMetric(
              metric.key,
              period.id
            );
          } catch {
            return null;
          }
        }
      );

    result.set(
      metric.key,
      values
    );
  }

  return result;
}

function buildInputVariables(
  inputs: InputDefinition[],
  periods: PeriodRecord[],
  periodValues: Array<{
    inputId: string;
    periodId: string;
    value: string;
  }>,
  workingValues: Array<{
    inputId: string;
    value: string;
  }>
): Map<
  string,
  Record<string, number>
> {
  const inputById =
    new Map(
      inputs.map(
        input => [
          input.id,
          input,
        ]
      )
    );

  const variablesByPeriod =
    new Map<
      string,
      Record<string, number>
    >();

  for (const period of periods) {
    variablesByPeriod.set(
      period.id,
      {}
    );
  }

  for (
    const periodValue
    of periodValues
  ) {
    const input =
      inputById.get(
        periodValue.inputId
      );

    if (!input) {
      continue;
    }

    if (
      input.type === "Text"
    ) {
      continue;
    }

    const value =
      numericValue(
        periodValue.value
      );

    if (value === undefined) {
      continue;
    }

    const variables =
      variablesByPeriod.get(
        periodValue.periodId
      );

    if (!variables) {
      continue;
    }

    variables[input.key] =
      value;
  }

  const workingVariables:
    Record<string, number> = {};

  for (
    const workingValue
    of workingValues
  ) {
    const input =
      inputById.get(
        workingValue.inputId
      );

    if (!input) {
      continue;
    }

    if (
      input.type === "Text"
    ) {
      continue;
    }

    const value =
      numericValue(
        workingValue.value
      );

    if (value === undefined) {
      continue;
    }

    workingVariables[
      input.key
    ] = value;
  }

  for (const period of periods) {
    const variables =
      variablesByPeriod.get(
        period.id
      );

    if (!variables) {
      continue;
    }

    for (
      const [
        key,
        value,
      ] of Object.entries(
        workingVariables
      )
    ) {
      if (
        variables[key] ===
        undefined
      ) {
        variables[key] =
          value;
      }
    }
  }

  return variablesByPeriod;
}

function cloneVariables(
  variablesByPeriod: Map<
    string,
    Record<string, number>
  >
) {
  const result =
    new Map<
      string,
      Record<string, number>
    >();

  for (
    const [
      periodId,
      variables,
    ] of variablesByPeriod
  ) {
    result.set(
      periodId,
      {
        ...variables,
      }
    );
  }

  return result;
}

function applyScenarioValues(
  baseVariables:
    Map<
      string,
      Record<string, number>
    >,
  scenarioValues:
    ScenarioValueRecord[],
  scenarioId: string,
  inputs: InputDefinition[],
  periods: PeriodRecord[]
) {
  const result =
    cloneVariables(
      baseVariables
    );

  const inputById =
    new Map(
      inputs.map(
        input => [
          input.id,
          input,
        ]
      )
    );

  const scalarValues =
    new Map<string, number>();

  const periodValues =
    new Map<
      string,
      Map<string, number>
    >();

  for (
    const value
    of scenarioValues
  ) {
    if (
      value.scenarioId !==
      scenarioId
    ) {
      continue;
    }

    const input =
      inputById.get(
        value.inputId
      );

    if (!input) {
      continue;
    }

    if (
      input.type === "Text"
    ) {
      continue;
    }

    const parsed =
      numericValue(
        value.value
      );

    if (parsed === undefined) {
      continue;
    }

    if (
      value.periodId ===
      null
    ) {
      scalarValues.set(
        input.key,
        parsed
      );

      continue;
    }

    let byInput =
      periodValues.get(
        value.periodId
      );

    if (!byInput) {
      byInput =
        new Map<string, number>();

      periodValues.set(
        value.periodId,
        byInput
      );
    }

    byInput.set(
      input.key,
      parsed
    );
  }

  for (const period of periods) {
    const variables =
      result.get(
        period.id
      );

    if (!variables) {
      continue;
    }

    for (
      const [
        key,
        value,
      ] of scalarValues
    ) {
      variables[key] =
        value;
    }

    const periodOverrides =
      periodValues.get(
        period.id
      );

    if (!periodOverrides) {
      continue;
    }

    for (
      const [
        key,
        value,
      ] of periodOverrides
    ) {
      variables[key] =
        value;
    }
  }

  return result;
}

function buildSourceValues(
  inputs: InputDefinition[],
  metrics: MetricDefinition[],
  periods: PeriodRecord[],
  variablesByPeriod: Map<
    string,
    Record<string, number>
  >
): Record<
  string,
  Array<number | null>
> {
  const values:
    Record<
      string,
      Array<number | null>
    > = {};

  for (const input of inputs) {
    if (
      input.type === "Text"
    ) {
      continue;
    }

    values[
      sourceKey(
        "input",
        input.id
      )
    ] = periods.map(
      period => {
        const variables =
          variablesByPeriod.get(
            period.id
          );

        return variables?.[
          input.key
        ] ?? null;
      }
    );
  }

  const metricValues =
    calculateMetricSeries(
      metrics,
      periods,
      variablesByPeriod
    );

  for (const metric of metrics) {
    values[
      sourceKey(
        "metric",
        metric.id
      )
    ] =
      metricValues.get(
        metric.key
      ) ??
      periods.map(
        () => null
      );
  }

  return values;
}

export async function getAnalyticsModelData(
  modelId: string,
  userId: string
): Promise<AnalyticsModelData> {
  const access =
    await requireModelAccess(
      modelId,
      userId
    );

  const [
    inputs,
    metrics,
    periods,
    periodValues,
    workingValues,
    scenarios,
  ] =
    await Promise.all([
      prisma.inputDefinition.findMany({
        where: {
          modelId,
          status: "ACTIVE",
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          name: true,
          key: true,
          type: true,
          unit: true,
          category: true,
        },
      }),

      prisma.metricDefinition.findMany({
        where: {
          modelId,
          status: "ACTIVE",
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          key: true,
          type: true,
          unit: true,
          category: true,
          formula: true,
        },
      }),

      prisma.modelPeriod.findMany({
        where: {
          modelId,
          status: "ACTIVE",
        },
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          id: true,
          name: true,
          key: true,
          sortOrder: true,
        },
      }),

      prisma.periodValue.findMany({
        where: {
          period: {
            modelId,
            status: "ACTIVE",
          },
          input: {
            modelId,
            status: "ACTIVE",
          },
        },
        select: {
          inputId: true,
          periodId: true,
          value: true,
        },
      }),

      prisma.workingValue.findMany({
        where: {
          userId:
            access.model.createdBy,
          input: {
            modelId,
            status: "ACTIVE",
          },
        },
        select: {
          inputId: true,
          value: true,
        },
      }),

      prisma.scenario.findMany({
        where: {
          modelId,
          status: "ACTIVE",
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

  const scenarioValues =
    scenarios.length === 0
      ? []
      : await prisma.scenarioValue.findMany({
          where: {
            scenarioId: {
              in: scenarios.map(
                scenario =>
                  scenario.id
              ),
            },
            input: {
              modelId,
              status: "ACTIVE",
            },
          },
          select: {
            scenarioId: true,
            inputId: true,
            periodId: true,
            value: true,
          },
        });

  const baseVariables =
    buildInputVariables(
      inputs,
      periods,
      periodValues,
      workingValues
    );

  const values =
    buildSourceValues(
      inputs,
      metrics,
      periods,
      baseVariables
    );

  const scenarioValuesByScenario:
    Record<
      string,
      Record<
        string,
        Array<number | null>
      >
    > = {};

  for (
    const scenario
    of scenarios
  ) {
    const variables =
      applyScenarioValues(
        baseVariables,
        scenarioValues,
        scenario.id,
        inputs,
        periods
      );

    scenarioValuesByScenario[
      scenario.id
    ] =
      buildSourceValues(
        inputs,
        metrics,
        periods,
        variables
      );
  }

  const sources:
    AnalyticsSource[] = [
      ...inputs
        .filter(
          input =>
            input.type !==
            "Text"
        )
        .map(
          input => ({
            sourceKey:
              sourceKey(
                "input",
                input.id
              ),
            id:
              input.id,
            kind:
              "input" as const,
            name:
              input.name,
            key:
              input.key,
            type:
              input.type,
            unit:
              input.unit,
            category:
              input.category,
          })
        ),

      ...metrics.map(
        metric => ({
          sourceKey:
            sourceKey(
              "metric",
              metric.id
            ),
          id:
            metric.id,
          kind:
            "metric" as const,
          name:
            metric.name,
          key:
            metric.key,
          type:
            metric.type,
          unit:
            metric.unit,
          category:
            metric.category,
        })
      ),
    ];

  const analyticsPeriods:
    AnalyticsPeriod[] =
    periods.map(
      period => ({
        id:
          period.id,
        name:
          period.name,
        key:
          period.key,
      })
    );

  const analyticsScenarios:
    AnalyticsScenario[] =
    scenarios.map(
      scenario => ({
        id:
          scenario.id,
        name:
          scenario.name,
      })
    );

  return {
    model: {
      id:
        access.model.id,
      name:
        access.model.name,
    },
    periods:
      analyticsPeriods,
    sources,
    scenarios:
      analyticsScenarios,
    values,
    scenarioValues:
      scenarioValuesByScenario,
  };
}

function parseAnalyticsChartConfig(
  chartId: string,
  chartName: string,
  rawConfig: string
): AnalyticsChartConfig {
  const parsed =
    JSON.parse(
      rawConfig
    ) as Partial<AnalyticsChartConfig>;

  return {
    title:
      parsed.title ??
      chartName,

    chartType:
      parsed.chartType ??
      "line",

    displayMode:
      parsed.displayMode ??
      "periods",

    series:
      Array.isArray(
        parsed.series
      )
        ? parsed.series.map(
            (series, index) => ({
              id:
                series.id ??
                `${chartId}-${index}`,

              sourceKey:
                series.sourceKey,

              scenarioId:
                series.scenarioId ??
                "base",

              label:
                typeof series.label ===
                "string"
                  ? series.label
                  : "",

              color:
                series.color ??
                "#2563eb",
            })
          )
        : [],

    showLegend:
      parsed.showLegend ??
      true,

    showGrid:
      parsed.showGrid ??
      true,

    showValues:
      parsed.showValues ??
      false,

    width:
      parsed.width ??
      560,

    height:
      parsed.height ??
      360,

    /**
     * Existing charts remain visible by default.
     */
    isVisible:
      parsed.isVisible ??
      true,

    /**
     * Existing charts are not pinned by default.
     */
    isPinned:
      parsed.isPinned ??
      false,
  };
}

function mapAnalyticsChart(
  chart: {
    id: string;
    modelId: string;
    name: string;
    config: string;
    createdAt: Date;
    updatedAt: Date;
  }
): AnalyticsChartRecord | null {
  try {
    const config =
      parseAnalyticsChartConfig(
        chart.id,
        chart.name,
        chart.config
      );

    return {
      id:
        chart.id,
      modelId:
        chart.modelId,
      name:
        chart.name,
      config,
      createdAt:
        chart.createdAt.toISOString(),
      updatedAt:
        chart.updatedAt.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getAnalyticsCharts(
  userId: string
): Promise<AnalyticsChartRecord[]> {
  const charts =
    await prisma.analyticsChart.findMany({
      where: {
        createdBy: userId,
      },

      orderBy: {
        createdAt: "asc",
      },

      select: {
        id: true,
        modelId: true,
        name: true,
        config: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  return charts.flatMap(
    chart => {
      const mapped =
        mapAnalyticsChart(
          chart
        );

      return mapped
        ? [mapped]
        : [];
    }
  );
}

export async function getAnalyticsChartsForModel(
  modelId: string,
  userId: string
): Promise<AnalyticsChartRecord[]> {
  await requireModelAccess(
    modelId,
    userId
  );

  const charts =
    await prisma.analyticsChart.findMany({
      where: {
        modelId,
        createdBy: userId,
      },

      orderBy: {
        createdAt: "asc",
      },

      select: {
        id: true,
        modelId: true,
        name: true,
        config: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  return charts.flatMap(
    chart => {
      const mapped =
        mapAnalyticsChart(
          chart
        );

      return mapped
        ? [mapped]
        : [];
    }
  );
}

export async function getAnalyticsDashboardData(
  userId: string
): Promise<AnalyticsDashboardData> {
  const models =
    await getBusinessModels(
      userId
    );

  const [
    modelData,
    charts,
  ] =
    await Promise.all([
      Promise.all(
        models.map(
          model =>
            getAnalyticsModelData(
              model.id,
              userId
            )
        )
      ),

      getAnalyticsCharts(
        userId
      ),
    ]);

  return {
    models:
      modelData,
    charts,
  };
}