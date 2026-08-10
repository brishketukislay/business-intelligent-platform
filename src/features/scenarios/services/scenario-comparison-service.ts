import {
  prisma,
} from "@/lib/prisma";

import {
  requireModelAccess,
} from "@/lib/model-access";

import {
  calculateScenarioMetrics,
} from "./scenario-calculation-service";


export type ScenarioComparisonMetric = {

  id: string;

  name: string;

  key: string;

  type: string;

  unit: string | null;

  formula: string;

  values: {
    scenarioId: string;
    scenarioName: string;
    value: number | null;
    error: string | null;
  }[];

};


export async function compareScenarios(
  modelId: string,
  userId: string
): Promise<{
  scenarios: {
    id: string;
    name: string;
  }[];
  metrics: ScenarioComparisonMetric[];
}> {

  /*
   * Shared-model users must be allowed to compare
   * scenarios as long as they have model access.
   */
  await requireModelAccess(
    modelId,
    userId
  );


  /*
   * Get all active scenarios belonging to this model.
   *
   * Do NOT check createdBy here.
   *
   * A user with access to a shared model should be
   * able to compare its scenarios.
   */
  const scenarios =
    await prisma.scenario.findMany({

      where: {

        modelId,

        status: "ACTIVE",

      },

      select: {

        id: true,

        name: true,

      },

      orderBy: {

        createdAt: "asc",

      },

    });


  if (scenarios.length === 0) {

    return {

      scenarios: [],

      metrics: [],

    };

  }


  /*
   * Calculate every scenario using the scenario's
   * own input values.
   */
  const calculated =
    await Promise.all(

      scenarios.map(
        async (scenario) => ({

          scenario,

          metrics:
            await calculateScenarioMetrics(
              scenario.id,
              userId
            ),

        })
      )

    );


  const metricMap =
    new Map<
      string,
      ScenarioComparisonMetric
    >();


  for (
    const scenarioResult
    of calculated
  ) {

    for (
      const metric
      of scenarioResult.metrics
    ) {

      let comparison =
        metricMap.get(
          metric.id
        );


      if (!comparison) {

        comparison = {

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

          formula:
            metric.formula,

          values: [],

        };


        metricMap.set(
          metric.id,
          comparison
        );

      }


      comparison.values.push({

        scenarioId:
          scenarioResult.scenario.id,

        scenarioName:
          scenarioResult.scenario.name,

        value:
          metric.value,

        error:
          metric.error,

      });

    }

  }


  return {

    scenarios,

    metrics:
      Array.from(
        metricMap.values()
      ),

  };

}
