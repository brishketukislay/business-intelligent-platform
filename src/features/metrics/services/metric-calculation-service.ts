import {
  prisma,
} from "@/lib/prisma";

import {
  evaluateFormula,
} from "./formula-engine";


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


/**
 * Calculate a collection of metrics.
 *
 * Metrics may reference:
 *
 * 1. Model inputs
 * 2. Other calculated metrics
 *
 * Example:
 *
 * effective_billable_hours
 *   = billable_interns * hours_per_week * working_weeks_year
 *
 * intern_salary_cost
 *   = effective_billable_hours * interns_pay_rate
 *
 * minimum_billing_rate
 *   = total_running_cost / effective_billable_hours
 *
 * The dependency resolution is recursive, so metric creation order
 * does not matter.
 */
function calculateMetricValues(
  metrics: MetricDefinition[],
  inputVariables: Record<string, number>,
): Map<string, number> {

  const metricByKey =
    new Map<string, MetricDefinition>();


  for (const metric of metrics) {

    metricByKey.set(
      metric.key,
      metric
    );

  }


  const calculatedValues =
    new Map<string, number>();


  const calculating =
    new Set<string>();


  function calculateMetric(
    key: string
  ): number {

    /*
     * If this is already a calculated metric,
     * return the cached value.
     */
    const cached =
      calculatedValues.get(key);


    if (
      cached !== undefined
    ) {

      return cached;

    }


    /*
     * Inputs are the base variables.
     */
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


    /*
     * Detect circular dependencies such as:
     *
     * metric_a = metric_b * 2
     * metric_b = metric_a * 2
     */
    if (
      calculating.has(key)
    ) {

      throw new Error(
        `Circular metric dependency involving "${key}".`
      );

    }


    calculating.add(key);


    try {

      /*
       * Build the variables required by this metric.
       *
       * The formula engine itself does not need to know whether
       * a variable came from an input or another metric.
       *
       * We discover identifiers from the formula and resolve
       * each one recursively.
       */
      const variables:
        Record<string, number> = {};


      const identifiers =
        extractIdentifiers(
          metric.formula
        );


      for (
        const identifier
        of identifiers
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


      if (
        !Number.isFinite(value)
      ) {

        throw new Error(
          `Metric "${metric.name}" produced an invalid result.`
        );

      }


      calculatedValues.set(
        key,
        value
      );


      return value;

    } finally {

      calculating.delete(key);

    }

  }


  /*
   * Calculate every metric so that the returned map contains
   * all calculated values.
   */
  for (
    const metric
    of metrics
  ) {

    calculateMetric(
      metric.key
    );

  }


  return calculatedValues;

}


/**
 * Extract variable names from a formula.
 *
 * Example:
 *
 * "billable_interns * hours_per_week * working_weeks_year"
 *
 * becomes:
 *
 * [
 *   "billable_interns",
 *   "hours_per_week",
 *   "working_weeks_year"
 * ]
 *
 * We deliberately keep this small and aligned with the formula
 * engine's identifier syntax.
 */
function extractIdentifiers(
  formula: string
): string[] {

  const matches =
    formula.match(
      /[a-zA-Z_][a-zA-Z0-9_]*/g
    );


  if (!matches) {

    return [];

  }


  return [
    ...new Set(matches),
  ];

}


/**
 * Calculate metrics for the current working model.
 */
export async function calculateMetrics(
  modelId: string,
  userId: string
): Promise<CalculatedMetric[]> {

  const model =
    await prisma.businessModel.findFirst({

      where: {

        id: modelId,

        createdBy: userId,

      },

      select: {

        id: true,

      },

    });


  if (!model) {

    throw new Error(
      "Business model not found or access denied."
    );

  }


  /*
   * Load active inputs.
   */
  const inputs =
    await prisma.inputDefinition.findMany({

      where: {

        modelId,

        status: "ACTIVE",

      },

      select: {

        id: true,

        key: true,

        type: true,

      },

    });


  /*
   * Load current working values.
   */
  const workingValues =
    await prisma.workingValue.findMany({

      where: {

        userId,

        input: {

          modelId,

          status: "ACTIVE",

        },

      },

      select: {

        inputId: true,

        value: true,

      },

    });


  const inputById =
    new Map(
      inputs.map(
        (input) => [
          input.id,
          input,
        ]
      )
    );


  /*
   * Convert working values into formula variables.
   */
  const inputVariables:
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


    const value =
      Number(
        workingValue.value
      );


    if (
      Number.isFinite(value)
    ) {

      inputVariables[input.key] =
        value;

    }

  }


  /*
   * Load active metric definitions.
   */
  const metrics =
    await prisma.metricDefinition.findMany({

      where: {

        modelId,

        status: "ACTIVE",

      },

      orderBy: {

        createdAt: "asc",

      },

    });


  /*
   * Calculate all metrics, including metric-to-metric
   * dependencies.
   */
  let calculatedValues:
    Map<string, number>;


  try {

    calculatedValues =
      calculateMetricValues(
        metrics,
        inputVariables
      );

  } catch (error) {

    /*
     * We don't want one broken metric to prevent all
     * other metrics from displaying.
     *
     * Individual metrics are therefore evaluated below
     * as well, allowing their own dependency errors to
     * be shown against the relevant metric.
     */
    calculatedValues =
      new Map<string, number>();

  }


  return metrics.map(
    (metric) => {

      try {

        let value =
          calculatedValues.get(
            metric.key
          );


        /*
         * If the global calculation failed, calculate this
         * metric individually so that we can provide a useful
         * error message.
         */
        if (
          value === undefined
        ) {

          const individualValues =
            calculateMetricValues(
              [metric, ...metrics],
              inputVariables
            );


          value =
            individualValues.get(
              metric.key
            );

        }


        if (
          value === undefined
        ) {

          throw new Error(
            `Unable to calculate metric "${metric.name}".`
          );

        }


        return {

          id: metric.id,

          name: metric.name,

          key: metric.key,

          type: metric.type,

          unit: metric.unit,

          category:
            metric.category,

          formula:
            metric.formula,

          value,

          error: null,

        };

      } catch (error) {

        return {

          id: metric.id,

          name: metric.name,

          key: metric.key,

          type: metric.type,

          unit: metric.unit,

          category:
            metric.category,

          formula:
            metric.formula,

          value: null,

          error:
            error instanceof Error
              ? error.message
              : "Unable to calculate metric.",

        };

      }

    }
  );

}


/**
 * Calculate metrics against a saved model snapshot.
 *
 * Saved values are treated as the input variables.
 * Calculated metrics can still depend on other calculated metrics.
 */
export async function calculateSavedModelMetrics(
  savedModelId: string,
  userId: string
): Promise<CalculatedMetric[]> {

  const savedModel =
    await prisma.savedModel.findFirst({

      where: {

        id: savedModelId,

        createdBy: userId,

      },

      select: {

        id: true,

        modelId: true,

      },

    });


  if (!savedModel) {

    throw new Error(
      "Saved model not found or access denied."
    );

  }


  const savedValues =
    await prisma.savedModelValue.findMany({

      where: {

        savedModelId,

        modelId:
          savedModel.modelId,

      },

      include: {

        input: {

          select: {

            id: true,

            key: true,

            type: true,

            status: true,

          },

        },

      },

    });


  /*
   * Convert saved input values into formula variables.
   */
  const inputVariables:
    Record<string, number> = {};


  for (
    const savedValue
    of savedValues
  ) {

    if (
      savedValue.input.status !== "ACTIVE"
    ) {

      continue;

    }


    const value =
      Number(
        savedValue.value
      );


    if (
      Number.isFinite(value)
    ) {

      inputVariables[
        savedValue.input.key
      ] = value;

    }

  }


  /*
   * Load the metric definitions belonging to the model.
   */
  const metrics =
    await prisma.metricDefinition.findMany({

      where: {

        modelId:
          savedModel.modelId,

        status:
          "ACTIVE",

      },

      orderBy: {

        createdAt:
          "asc",

      },

    });


  let calculatedValues:
    Map<string, number>;


  try {

    calculatedValues =
      calculateMetricValues(
        metrics,
        inputVariables
      );

  } catch {

    calculatedValues =
      new Map<string, number>();

  }


  return metrics.map(
    (metric) => {

      try {

        let value =
          calculatedValues.get(
            metric.key
          );


        if (
          value === undefined
        ) {

          const individualValues =
            calculateMetricValues(
              [metric, ...metrics],
              inputVariables
            );


          value =
            individualValues.get(
              metric.key
            );

        }


        if (
          value === undefined
        ) {

          throw new Error(
            `Unable to calculate metric "${metric.name}".`
          );

        }


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

          value,

          error:
            null,

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

        };

      }

    }

  );

}