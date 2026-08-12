import { prisma } from "@/lib/prisma";

import {
  requireModelAccess,
  requireModelEditAccess,
} from "@/lib/model-access";

type BusinessModelData = {
  name: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE";
  itemLabelSingular?: string;
  itemLabelPlural?: string;
};

export async function getBusinessModels(
  userId: string,
) {
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

  if (!user) {
    return [];
  }

  const include = {
    _count: {
      select: {
        inputs: true,
        metrics: true,
        periods: true,
        items: true,
      },
    },
  } as const;

  if (user.role === "ADMIN") {
    return prisma.businessModel.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include,
    });
  }

  return prisma.businessModel.findMany({
    where: {
      OR: [
        {
          createdBy: userId,
        },
        {
          access: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include,
  });
}

export async function getBusinessModelById(
  modelId: string,
  userId: string,
) {
  const access =
    await requireModelAccess(
      modelId,
      userId,
    );

  return prisma.businessModel.findUnique({
    where: {
      id: access.model.id,
    },
  });
}

export async function getBusinessModelOverview(
  modelId: string,
  userId: string,
) {
  const access =
    await requireModelAccess(
      modelId,
      userId,
    );

  const [
    model,
    inputs,
    metrics,
    periods,
    items,
  ] = await Promise.all([
    prisma.businessModel.findUnique({
      where: {
        id: access.model.id,
      },
      include: {
        settings: true,
        _count: {
          select: {
            inputs: true,
            metrics: true,
            periods: true,
            items: true,
          },
        },
      },
    }),

    prisma.inputDefinition.count({
      where: {
        modelId,
        status: "ACTIVE",
      },
    }),

    prisma.metricDefinition.count({
      where: {
        modelId,
        status: "ACTIVE",
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

    prisma.modelItem.count({
      where: {
        modelId,
        status: "ACTIVE",
      },
    }),
  ]);

  if (!model) {
    return null;
  }

  const periodInputCount =
    await prisma.inputDefinition.count({
      where: {
        modelId,
        status: "ACTIVE",
        scope: "PERIOD",
      },
    });

  const itemPeriodInputCount =
    await prisma.inputDefinition.count({
      where: {
        modelId,
        status: "ACTIVE",
        scope: "ITEM_PERIOD",
      },
    });

  const [
    periodValueCount,
    itemValueCount,
  ] = await Promise.all([
    periodInputCount > 0
      ? prisma.periodValue.count({
          where: {
            period: {
              modelId,
              status: "ACTIVE",
            },
            input: {
              modelId,
              status: "ACTIVE",
              scope: "PERIOD",
            },
            value: {
              not: "",
            },
          },
        })
      : 0,

    itemPeriodInputCount > 0 &&
    items > 0
      ? prisma.modelItemValue.count({
          where: {
            item: {
              modelId,
              status: "ACTIVE",
            },
            input: {
              modelId,
              status: "ACTIVE",
              scope: "ITEM_PERIOD",
            },
            value: {
              not: "",
            },
          },
        })
      : 0,
  ]);

  const expectedPeriodValues =
    periodInputCount *
    periods.length;

  const expectedItemValues =
    itemPeriodInputCount *
    items *
    periods.length;

  const expected =
    expectedPeriodValues +
    expectedItemValues;

  const entered =
    periodValueCount +
    itemValueCount;

  return {
    model,
    inputs,
    metrics,
    periods,
    items,
    completion:
      expected === 0
        ? 0
        : Math.min(
            100,
            Math.round(
              (entered / expected) *
                100,
            ),
          ),
  };
}

export async function createBusinessModel(
  data: BusinessModelData,
  userId: string,
) {
  return prisma.businessModel.create({
    data: {
      name: data.name,
      description:
        data.description || null,
      status:
        data.status || "ACTIVE",
      itemLabelSingular:
        data.itemLabelSingular ||
        "Item",
      itemLabelPlural:
        data.itemLabelPlural ||
        "Items",
      createdBy: userId,
    },
  });
}

export async function updateBusinessModel(
  modelId: string,
  data: BusinessModelData,
  userId: string,
) {
  await requireModelEditAccess(
    modelId,
    userId,
  );

  return prisma.businessModel.update({
    where: {
      id: modelId,
    },
    data: {
      name: data.name,
      description:
        data.description || null,
      status:
        data.status || "ACTIVE",
      itemLabelSingular:
        data.itemLabelSingular ||
        "Item",
      itemLabelPlural:
        data.itemLabelPlural ||
        "Items",
    },
  });
}

export async function deactivateBusinessModel(
  modelId: string,
  userId: string,
) {
  await requireModelEditAccess(
    modelId,
    userId,
  );

  return prisma.businessModel.update({
    where: {
      id: modelId,
    },
    data: {
      status: "INACTIVE",
    },
  });
}