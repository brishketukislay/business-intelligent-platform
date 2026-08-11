import { prisma } from "@/lib/prisma";

import {
  requireModelAccess,
} from "@/lib/model-access";

import {
  evaluateFormula,
  getFormulaIdentifiers,
} from "./formula-engine";

export type MetricPeriodValue = {
  periodId: string;
  periodName: string;
  periodKey: string;
  value: number | null;
  error: string | null;
};

export type CalculatedMetric = {
  id: string;
  name: string;
  key: string;
  type: string;
  unit: string | null;
  category: string | null;
  formula: string;
  value: number | null;
  error: string | null;
  periodValues: MetricPeriodValue[];
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

type ModelPeriodRecord = {
  id: string;
  name: string;
  key: string;
  sortOrder: number;
};

type Variables = Record<string, number>;

type CalculationContext = {
  modelVariables: Variables;
  variablesByPeriod: Map<string, Variables>;
  periods: ModelPeriodRecord[];
};

function toNumericValue(
  value: string | number | null | undefined
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : null;
}

function createPeriodVariables(
  periods: ModelPeriodRecord[]
): Map<string, Variables> {
  const result = new Map<string, Variables>();

  for (const period of periods) {
    result.set(period.id, {});
  }

  return result;
}

/**
 * Calculate one metric in a particular context.
 *
 * Model-level inputs are always available.
 * Period-level values override model-level values for
 * the same key when calculating a specific period.
 */
function calculateMetricValues(
  metrics: MetricDefinition[],
  context: CalculationContext
): {
  modelValues: Map<string, number>;
  periodValues: Map<string, Map<string, number>>;
  modelErrors: Map<string, string>;
  periodErrors: Map<string, Map<string, string>>;
} {
  const metricByKey = new Map<string, MetricDefinition>();

  for (const metric of metrics) {
    metricByKey.set(metric.key, metric);
  }

  const modelValues = new Map<string, number>();
  const periodValues = new Map<string, Map<string, number>>();

  const modelErrors = new Map<string, string>();
  const periodErrors = new Map<
    string,
    Map<string, string>
  >();

  const calculatingModel = new Set<string>();
  const calculatingPeriod = new Set<string>();

  function getPeriodVariables(
    periodId: string
  ): Variables {
    return (
      context.variablesByPeriod.get(periodId) ??
      {}
    );
  }

  function calculateModelMetric(
    key: string
  ): number {
    const cached = modelValues.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const directInput =
      context.modelVariables[key];

    if (directInput !== undefined) {
      return directInput;
    }

    const metric = metricByKey.get(key);

    if (!metric) {
      throw new Error(
        `Unknown input or metric "${key}".`
      );
    }

    if (calculatingModel.has(key)) {
      throw new Error(
        `Circular metric dependency involving "${key}".`
      );
    }

    calculatingModel.add(key);

    try {
      const variables: Variables = {};

      for (const identifier of getFormulaIdentifiers(
        metric.formula
      )) {
        variables[identifier] =
          calculateModelMetric(identifier);
      }

      const cumulative = (
        inputKey: string
      ): number => {
        let total = 0;

        /*
         * If there are periods and the requested key has
         * period values, use the period values.
         *
         * Otherwise fall back to the model-level value.
         */
        let foundPeriodValue = false;

        for (const period of context.periods) {
          const periodVariables =
            getPeriodVariables(period.id);

          const value =
            periodVariables[inputKey];

          if (value !== undefined) {
            total += value;
            foundPeriodValue = true;
          }
        }

        if (foundPeriodValue) {
          return total;
        }

        const modelValue =
          context.modelVariables[inputKey];

        if (modelValue !== undefined) {
          return modelValue;
        }

        if (metricByKey.has(inputKey)) {
          return calculateModelMetric(inputKey);
        }

        throw new Error(
          `Unknown input or metric "${inputKey}".`
        );
      };

      const value = evaluateFormula(
        metric.formula,
        variables,
        {
          CUMULATIVE: cumulative,
        }
      );

      if (!Number.isFinite(value)) {
        throw new Error(
          `Metric "${metric.name}" produced an invalid result.`
        );
      }

      modelValues.set(key, value);

      return value;
    } finally {
      calculatingModel.delete(key);
    }
  }

  function calculatePeriodMetric(
    key: string,
    periodId: string
  ): number {
    let valuesForMetric =
      periodValues.get(key);

    if (!valuesForMetric) {
      valuesForMetric = new Map<string, number>();
      periodValues.set(key, valuesForMetric);
    }

    const cached =
      valuesForMetric.get(periodId);

    if (cached !== undefined) {
      return cached;
    }

    const periodVariables =
      getPeriodVariables(periodId);

    /*
     * Period values take precedence over model-level
     * values. This is important for inputs that are
     * normally model-level but have period overrides.
     */
    const directPeriodInput =
      periodVariables[key];

    if (directPeriodInput !== undefined) {
      return directPeriodInput;
    }

    const modelInput =
      context.modelVariables[key];

    if (modelInput !== undefined) {
      return modelInput;
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
      calculatingPeriod.has(calculationKey)
    ) {
      throw new Error(
        `Circular metric dependency involving "${key}".`
      );
    }

    calculatingPeriod.add(calculationKey);

    try {
      const variables: Variables = {};

      for (const identifier of getFormulaIdentifiers(
        metric.formula
      )) {
        variables[identifier] =
          calculatePeriodMetric(
            identifier,
            periodId
          );
      }

      const currentPeriod =
        context.periods.find(
          period =>
            period.id === periodId
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
        let foundValue = false;

        for (const period of context.periods) {
          if (
            period.sortOrder >
            currentPeriod.sortOrder
          ) {
            break;
          }

          const variables =
            getPeriodVariables(period.id);

          const periodValue =
            variables[inputKey];

          if (periodValue !== undefined) {
            total += periodValue;
            foundValue = true;
            continue;
          }

          /*
           * A model-level input applies to every period,
           * so it contributes once per period when used
           * through CUMULATIVE().
           */
          const modelValue =
            context.modelVariables[inputKey];

          if (modelValue !== undefined) {
            total += modelValue;
            foundValue = true;
            continue;
          }

          if (metricByKey.has(inputKey)) {
            total += calculatePeriodMetric(
              inputKey,
              period.id
            );
            foundValue = true;
          }
        }

        if (!foundValue) {
          throw new Error(
            `Unknown input or metric "${inputKey}".`
          );
        }

        return total;
      };

      const value = evaluateFormula(
        metric.formula,
        variables,
        {
          CUMULATIVE: cumulative,
        }
      );

      if (!Number.isFinite(value)) {
        throw new Error(
          `Metric "${metric.name}" produced an invalid result.`
        );
      }

      valuesForMetric.set(
        periodId,
        value
      );

      return value;
    } finally {
      calculatingPeriod.delete(
        calculationKey
      );
    }
  }

  /*
   * First calculate model-level values.
   *
   * This is the important difference from the old
   * implementation: a metric no longer requires a
   * ModelPeriod to have a valid value.
   */
  for (const metric of metrics) {
    try {
      calculateModelMetric(metric.key);
    } catch (error) {
      modelErrors.set(
        metric.key,
        error instanceof Error
          ? error.message
          : "Unable to calculate metric."
      );
    }
  }

  /*
   * Then calculate every period.
   */
  for (const period of context.periods) {
    for (const metric of metrics) {
      try {
        calculatePeriodMetric(
          metric.key,
          period.id
        );
      } catch (error) {
        let errors =
          periodErrors.get(metric.key);

        if (!errors) {
          errors =
            new Map<string, string>();

          periodErrors.set(
            metric.key,
            errors
          );
        }

        errors.set(
          period.id,
          error instanceof Error
            ? error.message
            : "Unable to calculate metric."
        );
      }
    }
  }

  return {
    modelValues,
    periodValues,
    modelErrors,
    periodErrors,
  };
}

export async function calculateMetrics(
  modelId: string,
  userId: string
): Promise<CalculatedMetric[]> {
  const access =
    await requireModelAccess(
      modelId,
      userId
    );

  const dataOwnerId =
    access.model.createdBy;

  const [
    inputs,
    periods,
    periodValues,
    workingValues,
    metrics,
  ] = await Promise.all([
    prisma.inputDefinition.findMany({
      where: {
        modelId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        key: true,
        type: true,
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
        userId: dataOwnerId,
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
  ]);

  const inputById =
    new Map(
      inputs.map((input:any) => [
        input.id,
        input,
      ])
    );

  /*
   * Model-level variables.
   */
  const modelVariables: Variables = {};

  for (const workingValue of workingValues) {
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

    const numericValue =
      toNumericValue(
        workingValue.value
      );

    if (numericValue === null) {
      continue;
    }

    modelVariables[input.key] =
      numericValue;
  }

  /*
   * Period variables.
   */
  const variablesByPeriod =
    createPeriodVariables(
      periods
    );

  for (const periodValue of periodValues) {
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

    const numericValue =
      toNumericValue(
        periodValue.value
      );

    if (numericValue === null) {
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
      numericValue;
  }

  /*
   * Model-level inputs are fallback values for periods.
   *
   * Period-specific values always win.
   */
  for (const period of periods) {
    const variables =
      variablesByPeriod.get(
        period.id
      );

    if (!variables) {
      continue;
    }

    for (
      const [key, value]
      of Object.entries(modelVariables)
    ) {
      if (
        variables[key] === undefined
      ) {
        variables[key] = value;
      }
    }
  }

  const calculation =
    calculateMetricValues(
      metrics,
      {
        modelVariables,
        variablesByPeriod,
        periods,
      }
    );

  return metrics.map(metric => {
    const metricPeriodErrors =
      calculation.periodErrors.get(
        metric.key
      );

    const values =
      periods.map(period => ({
        periodId: period.id,
        periodName: period.name,
        periodKey: period.key,
        value:
          calculation.periodValues
            .get(metric.key)
            ?.get(period.id) ??
          null,
        error:
          metricPeriodErrors
            ?.get(period.id) ??
          null,
      }));

    /*
     * Prefer the latest period when periods exist.
     *
     * If there are no periods, use the model-level
     * calculation instead.
     */
    const latest =
      values.length > 0
        ? values[values.length - 1]
        : null;

    const modelValue =
      calculation.modelValues.get(
        metric.key
      ) ?? null;

    const modelError =
      calculation.modelErrors.get(
        metric.key
      ) ?? null;

    return {
      id: metric.id,
      name: metric.name,
      key: metric.key,
      type: metric.type,
      unit: metric.unit,
      category: metric.category,
      formula: metric.formula,

      value:
        latest?.value ??
        modelValue,

      error:
        latest?.error ??
        modelError ??
        null,

      periodValues: values,
    };
  });
}

/*
 * Scenario calculation API.
 *
 * This remains scalar and intentionally does not use
 * CUMULATIVE(). It is kept compatible with the existing
 * scenario calculation contract.
 */
export async function calculateMetricsFromValues(
  modelId: string,
  userId: string,
  inputVariables: Record<string, number>
): Promise<CalculatedMetric[]> {
  await requireModelAccess(
    modelId,
    userId
  );

  const metrics =
    await prisma.metricDefinition.findMany({
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
    });

  const metricByKey =
    new Map(
      metrics.map(metric => [
        metric.key,
        metric,
      ])
    );

  const values =
    new Map<string, number>();

  const calculating =
    new Set<string>();

  function calculateMetric(
    key: string
  ): number {
    const cached =
      values.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const inputValue =
      inputVariables[key];

    if (inputValue !== undefined) {
      return inputValue;
    }

    const metric =
      metricByKey.get(key);

    if (!metric) {
      throw new Error(
        `Unknown input or metric "${key}".`
      );
    }

    if (calculating.has(key)) {
      throw new Error(
        `Circular metric dependency involving "${key}".`
      );
    }

    calculating.add(key);

    try {
      const variables: Variables = {};

      for (
        const identifier
        of getFormulaIdentifiers(
          metric.formula
        )
      ) {
        variables[identifier] =
          calculateMetric(
            identifier
          );
      }

      const value =
        evaluateFormula(
          metric.formula,
          variables
        );

      if (!Number.isFinite(value)) {
        throw new Error(
          `Metric "${metric.name}" produced an invalid result.`
        );
      }

      values.set(
        key,
        value
      );

      return value;
    } finally {
      calculating.delete(key);
    }
  }

  return metrics.map(metric => {
    try {
      return {
        id: metric.id,
        name: metric.name,
        key: metric.key,
        type: metric.type,
        unit: metric.unit,
        category: metric.category,
        formula: metric.formula,
        value: calculateMetric(
          metric.key
        ),
        error: null,
        periodValues: [],
      };
    } catch (error) {
      return {
        id: metric.id,
        name: metric.name,
        key: metric.key,
        type: metric.type,
        unit: metric.unit,
        category: metric.category,
        formula: metric.formula,
        value: null,
        error:
          error instanceof Error
            ? error.message
            : "Unable to calculate metric.",
        periodValues: [],
      };
    }
  });
}