import {
  prisma,
} from "@/lib/prisma";

import {
  requireModelAccess,
} from "@/lib/model-access";

import {
  evaluateFormula,
} from "@/features/metrics/services/formula-engine";


export type CalculatedScenarioMetric = {

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
 * Extract variable names from a formula.
 *
 * Example:
 *
 * billable_interns * hours_per_week * working_weeks_year
 *
 * becomes:
 *
 * [
 *   "billable_interns",
 *   "hours_per_week",
 *   "working_weeks_year"
 * ]
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
 * Calculate all scenario metrics with
 * recursive metric dependencies.
 *
 * This means:
 *
 * metric_a = input_a * input_b
 *
 * metric_b = metric_a * input_c
 *
 * metric_c = metric_b + metric_a
 *
 * will work regardless of the order in
 * which the metrics were created.
 */
function calculateMetricValues(
  metrics: MetricDefinition[],
  inputVariables: Record<string, number>
): {
  values: Map<string, number>;
  errors: Map<string, string>;
} {

  const metricByKey =
    new Map<
      string,
      MetricDefinition
    >();


  for (
    const metric
    of metrics
  ) {

    metricByKey.set(
      metric.key,
      metric
    );

  }


  const calculatedValues =
    new Map<string, number>();


  const errors =
    new Map<string, string>();


  const calculating =
    new Set<string>();


  function calculateMetric(
    key: string
  ): number {

    /*
     * Return a previously calculated value.
     */
    const cached =
      calculatedValues.get(
        key
      );


    if (
      cached !== undefined
    ) {

      return cached;

    }


    /*
     * Base model input.
     */
    const inputValue =
      inputVariables[key];


    if (
      inputValue !== undefined
    ) {

      return inputValue;

    }


    /*
     * Find the metric referenced by the
     * formula.
     */
    const metric =
      metricByKey.get(
        key
      );


    if (!metric) {

      throw new Error(
        `Unknown variable "${key}".`
      );

    }


    /*
     * Detect circular dependencies.
     *
     * Example:
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


    calculating.add(
      key
    );


    try {

      const variables:
        Record<string, number> = {};


      /*
       * Find every identifier used by this
       * metric and recursively calculate it.
       */
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


      /*
       * Evaluate the formula after all
       * dependencies have been resolved.
       */
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

      calculating.delete(
        key
      );

    }

  }


  /*
   * Calculate every metric.
   *
   * Errors are recorded individually so one
   * broken metric does not prevent unrelated
   * metrics from displaying.
   */
  for (
    const metric
    of metrics
  ) {

    try {

      calculateMetric(
        metric.key
      );

    } catch (error) {

      errors.set(

        metric.key,

        error instanceof Error
          ? error.message
          : "Unable to calculate metric."

      );

    }

  }


  return {
    values:
      calculatedValues,

    errors,
  };

}


/**
 * Calculate metrics for a scenario.
 */
export async function calculateScenarioMetrics(
  scenarioId: string,
  userId: string
): Promise<CalculatedScenarioMetric[]> {

  /*
   * Find the scenario and its model.
   */
  const scenario =
    await prisma.scenario.findUnique({

      where: {

        id:
          scenarioId,

      },

      select: {

        id: true,

        modelId: true,

        status: true,

      },

    });


  if (!scenario) {

    throw new Error(
      "Scenario not found."
    );

  }


  if (
    scenario.status !== "ACTIVE"
  ) {

    throw new Error(
      "Scenario is not active."
    );

  }


  /*
   * Check model access.
   *
   * This supports owners, admins and
   * explicitly shared users.
   */
  await requireModelAccess(
    scenario.modelId,
    userId
  );


  /*
   * Load active inputs.
   */
  const inputs =
    await prisma.inputDefinition.findMany({

      where: {

        modelId:
          scenario.modelId,

        status:
          "ACTIVE",

      },

      select: {

        id: true,

        key: true,

        type: true,

      },

    });


  /*
   * Load this scenario's values.
   */
  const scenarioValues =
    await prisma.scenarioValue.findMany({

      where: {

        scenarioId:
          scenario.id,

        input: {

          modelId:
            scenario.modelId,

          status:
            "ACTIVE",

        },

      },

      select: {

        inputId: true,

        value: true,

      },

    });


  const inputById =
    new Map<
      string,
      {
        id: string;
        key: string;
        type: string;
      }
    >();


  for (
    const input
    of inputs
  ) {

    inputById.set(
      input.id,
      input
    );

  }


  /*
   * Convert scenario input values into
   * formula variables.
   */
  const inputVariables:
    Record<string, number> = {};


  for (
    const scenarioValue
    of scenarioValues
  ) {

    const input =
      inputById.get(
        scenarioValue.inputId
      );


    if (!input) {
      continue;
    }


    const value =
      Number(
        scenarioValue.value
      );


    if (
      Number.isFinite(value)
    ) {

      inputVariables[input.key] =
        value;

    }

  }


  /*
   * Load all active metric definitions.
   */
  const metrics =
    await prisma.metricDefinition.findMany({

      where: {

        modelId:
          scenario.modelId,

        status:
          "ACTIVE",

      },

      orderBy: {

        name:
          "asc",

      },

    });


  /*
   * Calculate recursively.
   */
  const calculation =
    calculateMetricValues(
      metrics,
      inputVariables
    );


  /*
   * Return metrics in the same shape expected
   * by the scenario UI.
   */
  return metrics.map(
    (metric) => {

      const value =
        calculation.values.get(
          metric.key
        );


      const error =
        calculation.errors.get(
          metric.key
        );


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
          value ??
          null,

        error:
          error ??
          null,

      };

    }
  );

}
