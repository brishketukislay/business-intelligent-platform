import { prisma } from "@/lib/prisma";

import {
  requireModelAccess,
  requireModelEditAccess,
} from "@/lib/model-access";

import {
  evaluateFormula,
  getFormulaIdentifiers,
} from "@/features/metrics/services/formula-engine";

function numericValue(
  value: string | null | undefined
): number | undefined {
  if (
    value === null ||
    value === undefined ||
    value.trim() === ""
  ) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : undefined;
}

export async function getModelItems(
  modelId: string,
  userId: string
) {
  await requireModelAccess(modelId, userId);

  return prisma.modelItem.findMany({
    where: {
      modelId,
      status: "ACTIVE",
    },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "asc" },
    ],
  });
}

export async function createModelItem(
  modelId: string,
  name: string,
  key: string,
  userId: string
) {
  await requireModelEditAccess(
    modelId,
    userId
  );

  const existing =
    await prisma.modelItem.findUnique({
      where: {
        modelId_key: {
          modelId,
          key,
        },
      },
    });

  if (existing) {
    throw new Error(
      "An item with this key already exists."
    );
  }

  const last =
    await prisma.modelItem.findFirst({
      where: {
        modelId,
      },
      orderBy: {
        sortOrder: "desc",
      },
      select: {
        sortOrder: true,
      },
    });

  return prisma.modelItem.create({
    data: {
      modelId,
      name,
      key,
      sortOrder:
        (last?.sortOrder ?? -1) + 1,
    },
  });
}

export async function updateModelItem(
  itemId: string,
  name: string,
  key: string,
  userId: string
) {
  const item =
    await prisma.modelItem.findUnique({
      where: {
        id: itemId,
      },
      select: {
        id: true,
        modelId: true,
      },
    });

  if (!item) {
    throw new Error(
      "Item not found."
    );
  }

  await requireModelEditAccess(
    item.modelId,
    userId
  );

  return prisma.modelItem.update({
    where: {
      id: itemId,
    },
    data: {
      name,
      key,
    },
  });
}

export async function deactivateModelItem(
  itemId: string,
  userId: string
) {
  const item =
    await prisma.modelItem.findUnique({
      where: {
        id: itemId,
      },
      select: {
        id: true,
        modelId: true,
      },
    });

  if (!item) {
    throw new Error(
      "Item not found."
    );
  }

  await requireModelEditAccess(
    item.modelId,
    userId
  );

  return prisma.modelItem.update({
    where: {
      id: itemId,
    },
    data: {
      status: "INACTIVE",
    },
  });
}

export async function upsertModelItemValue(
  data: {
    modelId: string;
    itemId: string;
    inputId: string;
    periodId?: string | null;
    value: string;
  },
  userId: string
) {
  await requireModelEditAccess(
    data.modelId,
    userId
  );

  const item =
    await prisma.modelItem.findFirst({
      where: {
        id: data.itemId,
        modelId: data.modelId,
        status: "ACTIVE",
      },
    });

  if (!item) {
    throw new Error(
      "Item does not belong to this model."
    );
  }

  const input =
    await prisma.inputDefinition.findFirst({
      where: {
        id: data.inputId,
        modelId: data.modelId,
        status: "ACTIVE",
      },
    });

  if (!input) {
    throw new Error(
      "Input does not belong to this model."
    );
  }

  if (
    input.scope !== "ITEM" &&
    input.scope !== "ITEM_PERIOD"
  ) {
    throw new Error(
      "This input is not configured for item values."
    );
  }

  const periodId =
    data.periodId ?? null;

  if (
    input.scope === "ITEM_PERIOD" &&
    !periodId
  ) {
    throw new Error(
      "A period is required for this input."
    );
  }

  if (
    input.scope === "ITEM" &&
    periodId
  ) {
    throw new Error(
      "This input does not accept a period."
    );
  }

  if (periodId) {
    const period =
      await prisma.modelPeriod.findFirst({
        where: {
          id: periodId,
          modelId: data.modelId,
          status: "ACTIVE",
        },
      });

    if (!period) {
      throw new Error(
        "Period does not belong to this model."
      );
    }
  }

  const value =
    data.value.trim();

  const existing =
    await prisma.modelItemValue.findFirst({
      where: {
        itemId: data.itemId,
        inputId: data.inputId,
        periodId,
      },
    });

  if (value === "") {
    if (existing) {
      await prisma.modelItemValue.delete({
        where: {
          id: existing.id,
        },
      });
    }

    return null;
  }

  if (
    input.type !== "Text" &&
    !Number.isFinite(Number(value))
  ) {
    throw new Error(
      "Value must be numeric."
    );
  }

  if (existing) {
    return prisma.modelItemValue.update({
      where: {
        id: existing.id,
      },
      data: {
        value,
      },
    });
  }

  return prisma.modelItemValue.create({
    data: {
      itemId: data.itemId,
      inputId: data.inputId,
      periodId,
      value,
    },
  });
}

/**
 * Main read model for the item dashboard.
 *
 * Metrics are calculated dynamically from inputs.
 * Metric results are not persisted.
 */
export async function getModelItemDashboard(
  modelId: string,
  userId: string
) {
  await requireModelAccess(
    modelId,
    userId
  );

  const [
    model,
    items,
    inputs,
    metrics,
    periods,
    modelPeriodValues,
  ] = await Promise.all([
    prisma.businessModel.findUnique({
      where: {
        id: modelId,
      },
      select: {
        id: true,
        name: true,
        itemLabelSingular: true,
        itemLabelPlural: true,
      },
    }),

    prisma.modelItem.findMany({
      where: {
        modelId,
        status: "ACTIVE",
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
    }),

    prisma.inputDefinition.findMany({
      where: {
        modelId,
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    prisma.metricDefinition.findMany({
      where: {
        modelId,
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "asc",
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
    }),
  ]);

  if (!model) {
    return null;
  }

  const itemValues =
    await prisma.modelItemValue.findMany({
      where: {
        item: {
          modelId,
          status: "ACTIVE",
        },
      },
      select: {
        itemId: true,
        inputId: true,
        periodId: true,
        value: true,
      },
    });

  const inputById =
    new Map(
      inputs.map(input => [
        input.id,
        input,
      ])
    );

  const metricByKey =
    new Map(
      metrics.map(metric => [
        metric.key,
        metric,
      ])
    );

  /**
   * Global model/period values.
   *
   * periodId -> inputKey -> value
   */
  const globalValues =
    new Map<
      string,
      Map<string, number>
    >();

  for (const period of periods) {
    globalValues.set(
      period.id,
      new Map<string, number>()
    );
  }

  for (const value of modelPeriodValues) {
    const input =
      inputById.get(value.inputId);

    if (!input) {
      continue;
    }

    const parsed =
      numericValue(value.value);

    if (parsed === undefined) {
      continue;
    }

    globalValues
      .get(value.periodId)!
      .set(
        input.key,
        parsed
      );
  }

  /**
   * Item period values.
   *
   * itemId
   *   -> periodId
   *      -> inputKey
   *         -> value
   */
  const itemValueMap =
    new Map<
      string,
      Map<
        string,
        Map<string, number>
      >
    >();

  /**
   * Item-level values which don't vary
   * by period.
   *
   * itemId -> inputKey -> value
   */
  const itemScalarMap =
    new Map<
      string,
      Map<string, number>
    >();

  for (const item of items) {
    itemValueMap.set(
      item.id,
      new Map()
    );

    itemScalarMap.set(
      item.id,
      new Map()
    );
  }

  for (const value of itemValues) {
    const input =
      inputById.get(value.inputId);

    if (!input) {
      continue;
    }

    const parsed =
      numericValue(value.value);

    if (parsed === undefined) {
      continue;
    }

    if (value.periodId === null) {
      itemScalarMap
        .get(value.itemId)!
        .set(
          input.key,
          parsed
        );

      continue;
    }

    let byPeriod =
      itemValueMap
        .get(value.itemId)!
        .get(value.periodId);

    if (!byPeriod) {
      byPeriod =
        new Map<string, number>();

      itemValueMap
        .get(value.itemId)!
        .set(
          value.periodId,
          byPeriod
        );
    }

    byPeriod.set(
      input.key,
      parsed
    );
  }

  /**
   * Calculate all metrics for one item.
   */
  function calculateItemMetricSeries(
    itemId: string
  ) {
    const cache =
      new Map<
        string,
        Map<string, number>
      >();

    const calculating =
      new Set<string>();

    function valueFor(
      key: string,
      periodIndex: number
    ): number {
      const period =
        periods[periodIndex];

      if (!period) {
        throw new Error(
          `Invalid period index "${periodIndex}".`
        );
      }

      const itemScalars =
        itemScalarMap.get(itemId)!;

      const itemPeriod =
        itemValueMap
          .get(itemId)!
          .get(period.id) ??
        new Map<string, number>();

      /**
       * Item-level values have priority.
       */
      if (
        itemScalars.has(key)
      ) {
        return itemScalars.get(key)!;
      }

      /**
       * Item-period values are next.
       */
      if (
        itemPeriod.has(key)
      ) {
        return itemPeriod.get(key)!;
      }

      /**
       * Finally fall back to global
       * period-level values.
       */
      const globalPeriod =
        globalValues.get(
          period.id
        );

      if (
        globalPeriod?.has(key)
      ) {
        return globalPeriod.get(key)!;
      }

      /**
       * If there is no raw input value,
       * treat the key as a metric and
       * calculate it recursively.
       */
      const metric =
        metricByKey.get(key);

      if (!metric) {
        throw new Error(
          `Unknown variable "${key}".`
        );
      }

      return calculateMetric(
        key,
        periodIndex
      );
    }

    function calculateMetric(
      key: string,
      periodIndex: number
    ): number {
      const period =
        periods[periodIndex];

      if (!period) {
        throw new Error(
          `Invalid period index "${periodIndex}".`
        );
      }

      let metricCache =
        cache.get(key);

      if (!metricCache) {
        metricCache =
          new Map<string, number>();

        cache.set(
          key,
          metricCache
        );
      }

      const cached =
        metricCache.get(
          period.id
        );

      if (cached !== undefined) {
        return cached;
      }

      const cycleKey =
        `${key}:${period.id}`;

      if (
        calculating.has(
          cycleKey
        )
      ) {
        throw new Error(
          `Circular metric dependency involving "${key}".`
        );
      }

      calculating.add(
        cycleKey
      );

      try {
        const metric =
          metricByKey.get(key);

        if (!metric) {
          throw new Error(
            `Unknown metric "${key}".`
          );
        }

        const variables:
          Record<string, number> = {};

        for (
          const identifier of
          getFormulaIdentifiers(
            metric.formula
          )
        ) {
          variables[identifier] =
            valueFor(
              identifier,
              periodIndex
            );
        }

        const cumulative =
          (
            inputKey: string
          ) => {
            let total = 0;

            for (
              let index = 0;
              index <= periodIndex;
              index++
            ) {
              total +=
                valueFor(
                  inputKey,
                  index
                );
            }

            return total;
          };

        const result =
          evaluateFormula(
            metric.formula,
            variables,
            {
              CUMULATIVE:
                cumulative,
            }
          );

        metricCache.set(
          period.id,
          result
        );

        return result;
      } finally {
        calculating.delete(
          cycleKey
        );
      }
    }

    return metrics.map(
      metric => ({
        metricId: metric.id,
        key: metric.key,
        name: metric.name,
        type: metric.type,
        unit: metric.unit,
        values:
          periods.map(
            (_, index) => {
              try {
                return calculateMetric(
                  metric.key,
                  index
                );
              } catch {
                return null;
              }
            }
          ),
      })
    );
  }

  const itemSeries =
    items.map(item => ({
      item: {
        id: item.id,
        name: item.name,
        key: item.key,
      },
      metrics:
        calculateItemMetricSeries(
          item.id
        ),
    }));

  /**
   * Portfolio aggregation.
   *
   * We aggregate calculated metric results,
   * rather than raw database values.
   */
  const portfolioMetrics =
    metrics.map(metric => ({
      metricId: metric.id,
      key: metric.key,
      name: metric.name,
      type: metric.type,
      unit: metric.unit,
      values:
        periods.map(
          (_, periodIndex) => {
            const values =
              itemSeries
                .map(item =>
                  item.metrics.find(
                    itemMetric =>
                      itemMetric.metricId ===
                      metric.id
                  )?.values[
                    periodIndex
                  ]
                )
                .filter(
                  (
                    value
                  ): value is number =>
                    value !== null &&
                    Number.isFinite(
                      value
                    )
                );

            if (
              values.length === 0
            ) {
              return null;
            }

            return values.reduce(
              (
                sum,
                value
              ) => sum + value,
              0
            );
          }
        ),
    }));

  return {
    model,

    items: items.map(item => ({
      id: item.id,
      name: item.name,
      key: item.key,
    })),

    inputs: inputs.map(input => ({
      id: input.id,
      name: input.name,
      key: input.key,
      type: input.type,
      unit: input.unit,
      category: input.category,
      scope: input.scope,
    })),

    metrics: metrics.map(metric => ({
      id: metric.id,
      name: metric.name,
      key: metric.key,
      type: metric.type,
      unit: metric.unit,
      formula: metric.formula,
    })),

    periods: periods.map(period => ({
      id: period.id,
      name: period.name,
      key: period.key,
    })),

    itemValues,

    itemSeries,

    portfolioMetrics,
  };
}