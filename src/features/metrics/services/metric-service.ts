import {
  prisma,
} from "@/lib/prisma";

import {
  requireModelAccess,
  requireModelEditAccess,
} from "@/lib/model-access";

import type {
  MetricDefinitionInput,
} from "../schemas/metric-schema";


export async function getMetricDefinitions(
  modelId: string,
  userId: string
) {

  /*
   * Anyone with access to the model can view
   * its metric definitions.
   */
  await requireModelAccess(
    modelId,
    userId
  );


  return prisma.metricDefinition.findMany({

    where: {

      modelId,

    },

    orderBy: {

      name: "asc",

    },

  });

}


export async function createMetricDefinition(
  data: MetricDefinitionInput,
  userId: string
) {

  /*
   * Creating/editing metrics requires EDIT access.
   */
  await requireModelEditAccess(
    data.modelId,
    userId
  );


  return prisma.metricDefinition.create({

    data: {

      modelId:
        data.modelId,

      name:
        data.name,

      key:
        data.key,

      type:
        data.type,

      unit:
        data.unit || null,

      category:
        data.category || null,

      formula:
        data.formula,

    },

  });

}


export async function updateMetricDefinition(
  id: string,
  data: MetricDefinitionInput,
  userId: string
) {

  const metric =
    await prisma.metricDefinition.findUnique({

      where: {

        id,

      },

      select: {

        id: true,

        modelId: true,

      },

    });


  if (!metric) {

    throw new Error(
      "Metric definition not found."
    );

  }


  /*
   * Editing the metric requires EDIT access
   * to the model that owns it.
   */
  await requireModelEditAccess(
    metric.modelId,
    userId
  );


  /*
   * Prevent a metric from being moved to a
   * different model through the update payload.
   */
  if (
    data.modelId !== metric.modelId
  ) {

    throw new Error(
      "Metric cannot be moved to another business model."
    );

  }


  return prisma.metricDefinition.update({

    where: {

      id:
        metric.id,

    },

    data: {

      name:
        data.name,

      key:
        data.key,

      type:
        data.type,

      unit:
        data.unit || null,

      category:
        data.category || null,

      formula:
        data.formula,

    },

  });

}


export async function deactivateMetricDefinition(
  id: string,
  userId: string
) {

  const metric =
    await prisma.metricDefinition.findUnique({

      where: {

        id,

      },

      select: {

        id: true,

        modelId: true,

      },

    });


  if (!metric) {

    throw new Error(
      "Metric definition not found."
    );

  }


  await requireModelEditAccess(
    metric.modelId,
    userId
  );


  return prisma.metricDefinition.update({

    where: {

      id:
        metric.id,

    },

    data: {
      status:
        "INACTIVE",
    },

  });

}