import {
  prisma,
} from "@/lib/prisma";

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


function calculateMetricValues(
  metrics: MetricDefinition[],
  inputVariablesByPeriod: Map<
    string,
    Record<string, number>
  >,
  periods: ModelPeriodRecord[],
): Map<
  string,
  Map<string, number>
> {

  const metricByKey =
    new Map<string, MetricDefinition>();


  for (
    const metric of metrics
  ) {

    metricByKey.set(
      metric.key,
      metric
    );

  }


  const calculatedValues =
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

    let periodValues =
      calculatedValues.get(key);


    if (!periodValues) {

      periodValues =
        new Map<string, number>();

      calculatedValues.set(
        key,
        periodValues
      );

    }


    const cached =
      periodValues.get(
        periodId
      );


    if (cached !== undefined) {

      return cached;

    }


    const inputVariables =
      inputVariablesByPeriod.get(
        periodId
      ) ?? {};


    const inputValue =
      inputVariables[key];


    if (
      inputValue !== undefined
    ) {

      return inputValue;

    }


    const metric =
      metricByKey.get(
        key
      );


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
            period.id === periodId
        );


      if (!currentPeriod) {

        throw new Error(
          `Unknown model period "${periodId}".`
        );

      }


      const cumulative =
        (
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


            const directInput =
              periodVariables[
                inputKey
              ];


            if (
              directInput !== undefined
            ) {

              total +=
                directInput;

              continue;

            }


            /*
             * CUMULATIVE can also reference a metric.
             * This makes the function future-proof for
             * cumulative metric chains.
             */
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


      const value =
        evaluateFormula(
          metric.formula,
          variables,
          {
            CUMULATIVE:
              cumulative,
          }
        );


      if (
        !Number.isFinite(value)
      ) {

        throw new Error(
          `Metric "${metric.name}" produced an invalid result.`
        );

      }


      periodValues.set(
        periodId,
        value
      );


      return value;

    } finally {

      calculating.delete(
        calculationKey
      );

    }

  }


  for (
    const period
    of periods
  ) {

    for (
      const metric
      of metrics
    ) {

      calculateMetric(
        metric.key,
        period.id
      );

    }

  }


  return calculatedValues;

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
      inputs.map(
        input => [
          input.id,
          input,
        ]
      )
    );


  /*
   * Period-based variables.
   */
  const inputVariablesByPeriod =
    new Map<
      string,
      Record<string, number>
    >();


  for (
    const period
    of periods
  ) {

    inputVariablesByPeriod.set(
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


    const numericValue =
      Number(
        periodValue.value
      );


    if (
      !Number.isFinite(
        numericValue
      )
    ) {
      continue;
    }


    const variables =
      inputVariablesByPeriod.get(
        periodValue.periodId
      );


    if (!variables) {
      continue;
    }


    variables[
      input.key
    ] =
      numericValue;

  }


  /*
   * Preserve existing model-level WorkingValue
   * behaviour for formulas that don't have a
   * period value.
   *
   * Period values take precedence.
   */
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
      workingValue.value.trim() === ""
    ) {
      continue;
    }


    const numericValue =
      Number(
        workingValue.value
      );


    if (
      !Number.isFinite(
        numericValue
      )
    ) {
      continue;
    }


    workingVariables[
      input.key
    ] =
      numericValue;

  }


  /*
   * Apply model-level values as fallback for every
   * period. This lets Hourly Rate remain model-level
   * until you decide to make it period-based.
   */
  for (
    const period
    of periods
  ) {

    const variables =
      inputVariablesByPeriod.get(
        period.id
      );


    if (!variables) {
      continue;
    }


    for (
      const [
        key,
        value,
      ]
      of Object.entries(
        workingVariables
      )
    ) {

      if (
        variables[key] === undefined
      ) {

        variables[key] =
          value;

      }

    }

  }


  const metricValues =
    calculateMetricValues(
      metrics,
      inputVariablesByPeriod,
      periods
    );


  return metrics.map(
    metric => {

      const values =
        periods.map(
          period => {

            const metricValue =
              metricValues
                .get(metric.key)
                ?.get(period.id);


            return {

              periodId:
                period.id,

              periodName:
                period.name,

              periodKey:
                period.key,

              value:
                metricValue ??
                null,

              error:
                null,

            };

          }
        );


      const latest =
        values[
          values.length - 1
        ];


      return {

        id:
          metric.id,

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

        formula:
          metric.formula,

        value:
          latest?.value ??
          null,

        error:
          null,

        periodValues:
          values,

      };

    }
  );

}


/*
 * Existing scenario calculation API.
 *
 * It remains scalar and therefore does not support
 * CUMULATIVE() yet. This preserves the existing
 * scenario contract while the main model becomes
 * period-aware.
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
      metrics.map(
        metric => [
          metric.key,
          metric,
        ]
      )
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


    if (
      cached !== undefined
    ) {
      return cached;
    }


    const inputValue =
      inputVariables[key];


    if (
      inputValue !== undefined
    ) {
      return inputValue;
    }


    const metric =
      metricByKey.get(key);


    if (!metric) {

      throw new Error(
        `Unknown input or metric "${key}".`
      );

    }


    if (
      calculating.has(key)
    ) {

      throw new Error(
        `Circular metric dependency involving "${key}".`
      );

    }


    calculating.add(key);


    try {

      const variables:
        Record<string, number> = {};


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


      values.set(
        key,
        value
      );


      return value;

    } finally {

      calculating.delete(key);

    }

  }


  return metrics.map(
    metric => {

      try {

        return {

          id:
            metric.id,

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

          formula:
            metric.formula,

          value:
            calculateMetric(
              metric.key
            ),

          error:
            null,

          periodValues:
            [],

        };

      } catch (error) {

        return {

          id:
            metric.id,

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

          formula:
            metric.formula,

          value:
            null,

          error:
            error instanceof Error
              ? error.message
              : "Unable to calculate metric.",

          periodValues:
            [],

        };

      }

    }
  );

}
