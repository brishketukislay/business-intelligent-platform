import {
  prisma,
} from "@/lib/prisma";

import {
  requireModelAccess,
  requireModelEditAccess,
} from "@/lib/model-access";

import {
  generateUniqueKey,
} from "@/lib/key-utils";

import {
  validateFormula,
} from "@/lib/formula-validation";

import {
  getFormulaIdentifiers,
} from "./formula-engine";

import type {
  MetricDefinitionInput,
} from "../schemas/metric-schema";

async function getDefinitionKeys(
  modelId: string
) {
  const [
    inputs,
    metrics,
  ] = await Promise.all([
    prisma.inputDefinition.findMany({
      where: {
        modelId,
        status: "ACTIVE",
      },
      select: {
        key: true,
      },
    }),

    prisma.metricDefinition.findMany({
      where: {
        modelId,
        status: "ACTIVE",
      },
      select: {
        key: true,
      },
    }),
  ]);

  return {
    inputKeys: inputs.map(
      (item:any) => item.key
    ),
    metricKeys: metrics.map(
      (item:any) => item.key
    ),
    allKeys: [
      ...inputs.map(
        (item:any) => item.key
      ),
      ...metrics.map(
        (item:any) => item.key
      ),
    ],
  };
}

async function validateMetricFormula(
  modelId: string,
  formula: string,
  metricKey: string,
  existingMetricId?: string
) {
  const definitions =
    await getDefinitionKeys(
      modelId
    );

  const availableKeys =
    definitions.allKeys.filter(
      (key) =>
        key !== metricKey
    );

  availableKeys.push(
    metricKey
  );

  const validation =
    validateFormula(
      formula,
      availableKeys,
      metricKey
    );

  if (!validation.valid) {
    throw new Error(
      validation.error ??
        "Invalid formula."
    );
  }

  /*
   * Prevent direct self-reference.
   */
  if (
    validation.references.includes(
      metricKey
    )
  ) {
    throw new Error(
      `Metric "${metricKey}" cannot reference itself.`
    );
  }

  /*
   * Validate the metric dependency graph.
   *
   * This catches A -> B -> A before the
   * calculation engine ever sees it.
   */
  const metrics =
    await prisma.metricDefinition.findMany({
      where: {
        modelId,
        status: "ACTIVE",
        ...(existingMetricId
          ? {
              NOT: {
                id: existingMetricId,
              },
            }
          : {}),
      },
      select: {
        id: true,
        key: true,
        formula: true,
      },
    });

  const graph =
    new Map<
      string,
      string[]
    >();

  for (const metric of metrics) {
    try {
      graph.set(
        metric.key,
        getFormulaIdentifiers(
          metric.formula
        ).filter(
          (reference) =>
            metrics.some(
              (candidate:any) =>
                candidate.key ===
                reference
            )
        )
      );
    } catch {
      graph.set(
        metric.key,
        []
      );
    }
  }

  graph.set(
    metricKey,
    validation.references.filter(
      (reference) =>
        metrics.some(
          (metric:any) =>
            metric.key ===
            reference
        )
    )
  );

  const visiting =
    new Set<string>();

  const visited =
    new Set<string>();

  function visit(
    key: string,
    path: string[]
  ) {
    if (visiting.has(key)) {
      const cycleStart =
        path.indexOf(key);

      const cycle =
        cycleStart >= 0
          ? path
              .slice(cycleStart)
              .concat(key)
          : path.concat(key);

      throw new Error(
        `Circular metric dependency: ${cycle.join(
          " → "
        )}.`
      );
    }

    if (visited.has(key)) {
      return;
    }

    visiting.add(key);

    for (
      const dependency of
        graph.get(key) ?? []
    ) {
      visit(
        dependency,
        [...path, key]
      );
    }

    visiting.delete(key);
    visited.add(key);
  }

  visit(metricKey, []);
}

function getDatabaseError(
  error: unknown,
  fallback: string
): Error {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return new Error(
      "That key is already in use. Please choose a different key."
    );
  }

  return error instanceof Error
    ? error
    : new Error(fallback);
}

export async function getMetricDefinitions(
  modelId: string,
  userId: string
) {
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

export async function getMetricFormulaContext(
  modelId: string,
  userId: string
) {
  await requireModelAccess(
    modelId,
    userId
  );

  const [
    inputs,
    metrics,
  ] = await Promise.all([
    prisma.inputDefinition.findMany({
      where: {
        modelId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        key: true,
        type: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.metricDefinition.findMany({
      where: {
        modelId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        key: true,
        type: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return {
    inputs,
    metrics,
    functions: [
      {
        name: "CUMULATIVE",
        description:
          "Adds a key's values from the first period through the current period.",
        example:
          "CUMULATIVE(revenue)",
      },
    ],
  };
}

export async function createMetricDefinition(
  data: MetricDefinitionInput,
  userId: string
) {
  await requireModelEditAccess(
    data.modelId,
    userId
  );

  const definitions =
    await getDefinitionKeys(
      data.modelId
    );

  const key =
    data.key?.trim() ||
    generateUniqueKey(
      data.name,
      definitions.allKeys
    );

  if (
    definitions.allKeys.includes(
      key
    )
  ) {
    throw new Error(
      `The key "${key}" is already in use.`
    );
  }

  await validateMetricFormula(
    data.modelId,
    data.formula,
    key
  );

  try {
    return await prisma.metricDefinition.create({
      data: {
        modelId:
          data.modelId,

        name:
          data.name,

        key,

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
  } catch (error) {
    throw getDatabaseError(
      error,
      "Unable to create metric definition."
    );
  }
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
        key: true,
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

  if (
    data.modelId !==
    metric.modelId
  ) {
    throw new Error(
      "Metric cannot be moved to another business model."
    );
  }

  const definitions =
    await getDefinitionKeys(
      metric.modelId
    );

  const key =
    data.key?.trim() ||
    metric.key;

  const duplicate =
    definitions.allKeys.some(
      (existingKey) =>
        existingKey === key &&
        existingKey !==
          metric.key
    );

  if (duplicate) {
    throw new Error(
      `The key "${key}" is already in use.`
    );
  }

  await validateMetricFormula(
    metric.modelId,
    data.formula,
    key,
    metric.id
  );

  try {
    return await prisma.metricDefinition.update({
      where: {
        id: metric.id,
      },
      data: {
        name:
          data.name,

        key,

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
  } catch (error) {
    throw getDatabaseError(
      error,
      "Unable to update metric definition."
    );
  }
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
      id: metric.id,
    },
    data: {
      status: "INACTIVE",
    },
  });
}