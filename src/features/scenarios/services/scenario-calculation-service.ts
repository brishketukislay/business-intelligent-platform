import {
  prisma,
} from "@/lib/prisma";

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


export async function calculateScenarioMetrics(
  scenarioId: string,
  userId: string
): Promise<CalculatedScenarioMetric[]> {

  const scenario =
    await prisma.scenario.findFirst({

      where: {

        id: scenarioId,

        createdBy: userId,

      },

      select: {

        id: true,

        modelId: true,

      },

    });


  if (!scenario) {

    throw new Error(
      "Scenario not found or access denied."
    );

  }


  const inputs =
    await prisma.inputDefinition.findMany({

      where: {

        modelId: scenario.modelId,

        status: "ACTIVE",

      },

      select: {

        id: true,

        key: true,

        type: true,

      },

    });


  const scenarioValues =
    await prisma.scenarioValue.findMany({

      where: {

        scenarioId,

        input: {

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


  const variables:
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

      variables[input.key] =
        value;

    }

  }


  const metrics =
    await prisma.metricDefinition.findMany({

      where: {

        modelId: scenario.modelId,

        status: "ACTIVE",

      },

      orderBy: {

        createdAt: "asc",

      },

    });


  return metrics.map(
    (metric) => {

      try {

        const value =
          evaluateFormula(
            metric.formula,
            variables
          );


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
              : "Unable to calculate scenario metric.",

        };

      }

    }
  );

}
