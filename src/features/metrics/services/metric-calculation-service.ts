import {
  prisma,
} from "@/lib/prisma";

import {
  requireModelAccess,
} from "@/lib/model-access";

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

    const cached =
      calculatedValues.get(key);


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


export async function calculateMetrics(
  modelId: string,
  userId: string
): Promise<CalculatedMetric[]> {

  /*
   * The logged-in user may be the owner or may have
   * VIEW/EDIT access through BusinessModelAccess.
   */
  const access =
    await requireModelAccess(
      modelId,
      userId
    );


  /*
   * Working values belong to the model owner.
   *
   * This is important when another user has access to
   * the model. We must load the owner's values rather
   * than looking for WorkingValue rows belonging to
   * the logged-in user.
   */
  const dataOwnerId =
    access.model.createdBy;


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
   * Load the model owner's working values.
   */
  const workingValues =
    await prisma.workingValue.findMany({

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


    /*
     * Empty values are ignored.
     */
    if (
      workingValue.value.trim() === ""
    ) {
      continue;
    }


    const numericValue =
      Number(
        workingValue.value
      );


    /*
     * Only numeric values participate in
     * formula calculations.
     */
    if (
      Number.isFinite(
        numericValue
      )
    ) {

      inputVariables[input.key] =
        numericValue;

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


  const results:
    CalculatedMetric[] = [];


  /*
   * Calculate each metric individually so that one
   * invalid formula does not prevent all other metrics
   * from being displayed.
   */
  for (
    const metric
    of metrics
  ) {

    try {

      const values =
        calculateMetricValues(
          metrics,
          inputVariables
        );


      results.push({

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
          values.get(
            metric.key
          ) ?? null,

        error:
          null,

      });

    } catch (error) {

      results.push({

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

      });

    }

  }


  return results;

}


/**
 * Calculate metrics for a specific user's
 * scenario values.
 *
 * Kept separate from calculateMetrics because
 * scenario values are owned by the scenario rather
 * than the model owner's WorkingValue rows.
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


  const values =
    calculateMetricValues(
      metrics,
      inputVariables
    );


  return metrics.map(
    (metric) => ({

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
        values.get(
          metric.key
        ) ?? null,

      error:
        null,

    })
  );

}
/**
 * Calculate metrics using the values stored in a SavedModel.
 *
 * This uses the exact same metric dependency/calculation logic
 * as the normal working-model calculation, but takes its input
 * values from the saved snapshot instead of WorkingValue.
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

        model: {

          select: {

            id: true,

            createdBy: true,

          },

        },

      },

    });


  if (!savedModel) {

    throw new Error(
      "Saved model not found or access denied."
    );

  }


  /*
   * Load all active inputs belonging to the model.
   */
  const inputs =
    await prisma.inputDefinition.findMany({

      where: {

        modelId:
          savedModel.modelId,

        status: "ACTIVE",

      },

      select: {

        id: true,

        key: true,

        type: true,

      },

    });


  /*
   * Load the saved values belonging to this snapshot.
   */
  const savedValues =
    await prisma.savedModelValue.findMany({

      where: {

        savedModelId:
          savedModelId,

        input: {

          modelId:
            savedModel.modelId,

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
   * Convert saved values into formula variables.
   */
  const inputVariables:
    Record<string, number> = {};


  for (
    const savedValue
    of savedValues
  ) {

    const input =
      inputById.get(
        savedValue.inputId
      );


    if (!input) {
      continue;
    }


    /*
     * Text inputs cannot participate in numeric formulas.
     */
    if (
      input.type === "Text"
    ) {
      continue;
    }


    const numericValue =
      Number(
        savedValue.value
      );


    if (
      Number.isFinite(
        numericValue
      )
    ) {

      inputVariables[
        input.key
      ] =
        numericValue;

    }

  }


  /*
   * Load active metric definitions.
   */
  const metrics =
    await prisma.metricDefinition.findMany({

      where: {

        modelId:
          savedModel.modelId,

        status: "ACTIVE",

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

      orderBy: {

        name: "asc",

      },

    });


  const metricValues =
    new Map<string, number>();


  const calculating =
    new Set<string>();


  const metricByKey =
    new Map(
      metrics.map(
        (metric) => [
          metric.key,
          metric,
        ]
      )
    );


  function calculateMetric(
    key: string
  ): number {

    /*
     * Return a previously calculated metric.
     */
    const cached =
      metricValues.get(
        key
      );


    if (
      cached !== undefined
    ) {

      return cached;

    }


    /*
     * Input values are the base variables.
     */
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


    /*
     * Detect circular metric dependencies.
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


      const identifiers =
        extractIdentifiers(
          metric.formula
        );


      for (
        const identifier
        of identifiers
      ) {

        variables[
          identifier
        ] =
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
        !Number.isFinite(
          value
        )
      ) {

        throw new Error(
          `Metric "${metric.name}" produced an invalid result.`
        );

      }


      metricValues.set(
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
   * Calculate each metric independently.
   *
   * If one metric fails, keep the error on that metric rather
   * than preventing the remaining metrics from being returned.
   */
  return metrics.map(
    (metric) => {

      try {

        const value =
          calculateMetric(
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
