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

import type {
  InputDefinitionInput,
} from "../schemas/input-schema";

function getFriendlyDatabaseError(
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

async function getAvailableDefinitionKeys(
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

  return [
    ...inputs.map((item:any) => item.key),
    ...metrics.map((item:any) => item.key),
  ];
}

export async function getInputDefinitions(
  modelId: string,
  userId: string
) {
  await requireModelAccess(
    modelId,
    userId
  );

  return prisma.inputDefinition.findMany({
    where: {
      modelId,
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getInputPeriodData(
  modelId: string,
  userId: string
) {
  await requireModelAccess(
    modelId,
    userId
  );

  const [
    periods,
    values,
  ] = await Promise.all([
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

    prisma.periodValue.findMany({
      where: {
        period: {
          modelId,
        },
        input: {
          modelId,
          status: "ACTIVE",
        },
      },
      select: {
        inputId: true,
        periodId: true,
        value: true,
      },
    }),
  ]);

  return {
    periods,
    values,
  };
}

export async function createInputDefinition(
  data: InputDefinitionInput,
  userId: string
) {
  await requireModelEditAccess(
    data.modelId,
    userId
  );

  const existingKeys =
    await getAvailableDefinitionKeys(
      data.modelId
    );

  const key =
    data.key?.trim() ||
    generateUniqueKey(
      data.name,
      existingKeys
    );

  if (
    existingKeys.includes(key)
  ) {
    throw new Error(
      `The key "${key}" is already in use.`
    );
  }

  try {
    return await prisma.inputDefinition.create({
      data: {
        modelId: data.modelId,
        name: data.name,
        key,
        type: data.type,
        scope: data.scope,
        unit: data.unit || null,
        category: data.category || null,
      },
    });
  } catch (error) {
    throw getFriendlyDatabaseError(
      error,
      "Unable to create input definition."
    );
  }
}

export async function updateInputDefinition(
  id: string,
  data: InputDefinitionInput,
  userId: string
) {
  const input =
    await prisma.inputDefinition.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        modelId: true,
        key: true,
      },
    });

  if (!input) {
    throw new Error(
      "Input definition not found or access denied."
    );
  }

  if (
    input.modelId !== data.modelId
  ) {
    throw new Error(
      "Input does not belong to this business model."
    );
  }

  await requireModelEditAccess(
    input.modelId,
    userId
  );

  const existingKeys =
    await getAvailableDefinitionKeys(
      input.modelId
    );

  const requestedKey =
    data.key?.trim() || input.key;

  const duplicateKey =
    existingKeys.some(
      (key) =>
        key === requestedKey &&
        key !== input.key
    );

  if (duplicateKey) {
    throw new Error(
      `The key "${requestedKey}" is already in use.`
    );
  }

  try {
    return await prisma.inputDefinition.update({
      where: {
        id: input.id,
      },
      data: {
        name: data.name,
        key: requestedKey,
        type: data.type,
        scope: data.scope,
        unit: data.unit || null,
        category: data.category || null,
      },
    });
  } catch (error) {
    throw getFriendlyDatabaseError(
      error,
      "Unable to update input definition."
    );
  }
}

export async function deactivateInputDefinition(
  id: string,
  userId: string
) {
  const input =
    await prisma.inputDefinition.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        modelId: true,
      },
    });

  if (!input) {
    throw new Error(
      "Input definition not found or access denied."
    );
  }

  await requireModelEditAccess(
    input.modelId,
    userId
  );

  return prisma.inputDefinition.update({
    where: {
      id: input.id,
    },
    data: {
      status: "INACTIVE",
    },
  });
}

export async function upsertPeriodValue(
  data: {
    modelId: string;
    inputId: string;
    periodId: string;
    value: string;
  },
  userId: string
) {
  await requireModelEditAccess(
    data.modelId,
    userId
  );

  const [
    input,
    period,
  ] = await Promise.all([
    prisma.inputDefinition.findFirst({
      where: {
        id: data.inputId,
        modelId: data.modelId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        type: true,
      },
    }),

    prisma.modelPeriod.findFirst({
      where: {
        id: data.periodId,
        modelId: data.modelId,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!input) {
    throw new Error(
      "Input does not belong to this business model."
    );
  }

  if (!period) {
    throw new Error(
      "Period does not belong to this business model."
    );
  }

  const value =
    data.value.trim();

  if (value === "") {
    await prisma.periodValue.deleteMany({
      where: {
        inputId: data.inputId,
        periodId: data.periodId,
      },
    });

    return null;
  }

  if (
    input.type === "Number" ||
    input.type === "Currency" ||
    input.type === "Percentage"
  ) {
    const numericValue =
      Number(value);

    if (
      !Number.isFinite(
        numericValue
      )
    ) {
      throw new Error(
        `${input.type} input must be a valid number.`
      );
    }
  }

  if (
    input.type === "Text" &&
    value.length > 1000
  ) {
    throw new Error(
      "Text input must be 1000 characters or less."
    );
  }

  try {
    return await prisma.periodValue.upsert({
      where: {
        periodId_inputId: {
          periodId:
            data.periodId,
          inputId:
            data.inputId,
        },
      },

      update: {
        value,
      },

      create: {
        periodId:
          data.periodId,
        inputId:
          data.inputId,
        value,
      },
    });
  } catch (error) {
    throw getFriendlyDatabaseError(
      error,
      "Unable to save period value."
    );
  }
}