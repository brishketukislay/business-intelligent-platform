import {
  prisma,
} from "@/lib/prisma";

import {
  calculateSavedModelMetrics,
  type CalculatedMetric,
} from "@/features/metrics/services/metric-calculation-service";


export type SavedModelComparisonValue = {

  key: string;

  name: string;

  type: string;

  unit: string | null;

  valueA: string | null;

  valueB: string | null;

};


export type SavedModelComparisonMetric = {

  key: string;

  name: string;

  type: string;

  unit: string | null;

  valueA: number | null;

  valueB: number | null;

  difference: number | null;

  errorA: string | null;

  errorB: string | null;

};


export type SavedModelComparison = {

  snapshotA: {

    id: string;

    name: string;

    createdAt: Date;

  };

  snapshotB: {

    id: string;

    name: string;

    createdAt: Date;

  };

  values: SavedModelComparisonValue[];

  metrics: SavedModelComparisonMetric[];

};


export async function compareSavedModels(
  modelId: string,
  savedModelIdA: string,
  savedModelIdB: string,
  userId: string
): Promise<SavedModelComparison> {

  if (
    savedModelIdA ===
    savedModelIdB
  ) {

    throw new Error(
      "Please select two different saved models."
    );

  }


  /*
   * Confirm the user can access the model.
   */
  const model =
    await prisma.businessModel.findFirst({

      where: {

        id:
          modelId,

        createdBy:
          userId,

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
   * Load both saved snapshots.
   */
  const savedModels =
    await prisma.savedModel.findMany({

      where: {

        modelId,

        createdBy:

          userId,

        id: {

          in: [

            savedModelIdA,

            savedModelIdB,

          ],

        },

      },

      include: {

        values: {

          include: {

            input: true,

          },

        },

      },

    });


  const snapshotA =
    savedModels.find(
      (snapshot) =>
        snapshot.id ===
        savedModelIdA
    );


  const snapshotB =
    savedModels.find(
      (snapshot) =>
        snapshot.id ===
        savedModelIdB
    );


  if (
    !snapshotA ||
    !snapshotB
  ) {

    throw new Error(
      "One or both saved models could not be found."
    );

  }


  /*
   * Build lookup maps for input values.
   */
  const valuesByKeyA =
    new Map(
      snapshotA.values.map(
        (savedValue) => [

          savedValue.input.key,

          savedValue,

        ]
      )
    );


  const valuesByKeyB =
    new Map(
      snapshotB.values.map(
        (savedValue) => [

          savedValue.input.key,

          savedValue,

        ]
      )
    );


  /*
   * Combine all input keys from both snapshots.
   */
  const allKeys =
    new Set<string>([

      ...valuesByKeyA.keys(),

      ...valuesByKeyB.keys(),

    ]);


  const values:
    SavedModelComparisonValue[] = [];


  for (
    const key
    of allKeys
  ) {

    const valueA =
      valuesByKeyA.get(
        key
      );


    const valueB =
      valuesByKeyB.get(
        key
      );


    const input =
      valueA?.input ??
      valueB?.input;


    if (!input) {
      continue;
    }


    values.push({

      key,

      name:
        input.name,

      type:
        input.type,

      unit:
        input.unit,

      valueA:
        valueA?.value ??
        null,

      valueB:
        valueB?.value ??
        null,

    });

  }


  /*
   * Calculate metrics for both snapshots.
   *
   * CalculatedMetric[] gives TypeScript the correct metric
   * type, so the maps below are strongly typed.
   */
  const [
    metricsA,
    metricsB,
  ] =
    await Promise.all([

      calculateSavedModelMetrics(
        savedModelIdA,
        userId
      ),

      calculateSavedModelMetrics(
        savedModelIdB,
        userId
      ),

    ]);


  const metricsByKeyA =
    new Map<string, CalculatedMetric>(

      metricsA.map(
        (metric) => [

          metric.key,

          metric,

        ]
      )

    );


  const metricsByKeyB =
    new Map<string, CalculatedMetric>(

      metricsB.map(
        (metric) => [

          metric.key,

          metric,

        ]
      )

    );


  const metricKeys =
    new Set<string>([

      ...metricsByKeyA.keys(),

      ...metricsByKeyB.keys(),

    ]);


  const metrics:
    SavedModelComparisonMetric[] = [];


  for (
    const key
    of metricKeys
  ) {

    const metricA =
      metricsByKeyA.get(
        key
      );


    const metricB =
      metricsByKeyB.get(
        key
      );


    const metric =
      metricA ??
      metricB;


    if (!metric) {
      continue;
    }


    let difference:
      number | null = null;


    if (

      metricA?.value !== null &&

      metricA?.value !== undefined &&

      metricB?.value !== null &&

      metricB?.value !== undefined

    ) {

      difference =
        metricB.value -
        metricA.value;

    }


    metrics.push({

      key,

      name:
        metric.name,

      type:
        metric.type,

      unit:
        metric.unit,

      valueA:
        metricA?.value ??
        null,

      valueB:
        metricB?.value ??
        null,

      difference,

      errorA:
        metricA?.error ??
        null,

      errorB:
        metricB?.error ??
        null,

    });

  }


  return {

    snapshotA: {

      id:
        snapshotA.id,

      name:
        snapshotA.name,

      createdAt:
        snapshotA.createdAt,

    },

    snapshotB: {

      id:
        snapshotB.id,

      name:
        snapshotB.name,

      createdAt:
        snapshotB.createdAt,

    },

    values,

    metrics,

  };

}