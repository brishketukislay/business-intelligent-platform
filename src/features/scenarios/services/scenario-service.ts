import {
  prisma,
} from "@/lib/prisma";

import {
  requireModelAccess,
  requireModelEditAccess,
} from "@/lib/model-access";

import {
  duplicateScenarioRecord,
} from "./scenario-duplicate-service";


export async function getScenarios(
  modelId: string,
  userId: string
) {

  await requireModelAccess(
    modelId,
    userId
  );


  return prisma.scenario.findMany({

    where: {
      modelId,
      status: "ACTIVE",
    },

    include: {

      values: {

        include: {
          input: true,
        },

      },

    },

    orderBy: {
      createdAt: "desc",
    },

  });

}


export async function getScenarioById(
  scenarioId: string,
  userId: string
) {

  const scenario =
    await prisma.scenario.findUnique({

      where: {
        id: scenarioId,
      },

      include: {

        values: {

          include: {
            input: true,
          },

        },

      },

    });


  if (!scenario) {
    return null;
  }


  await requireModelAccess(
    scenario.modelId,
    userId
  );


  return scenario;

}


export async function createScenario(
  modelId: string,
  userId: string,
  name: string,
  description?: string
) {

  await requireModelEditAccess(
    modelId,
    userId
  );


  /*
   * Create the scenario first.
   */
  const scenario =
    await prisma.scenario.create({

      data: {

        modelId,

        createdBy:
          userId,

        name,

        description:
          description || null,

      },

    });


  /*
   * Find the latest saved model for this
   * business model.
   *
   * SavedModel is ordered by createdAt, so
   * the newest snapshot is used as the
   * starting point for the scenario.
   */
  const latestSavedModel =
    await prisma.savedModel.findFirst({

      where: {
        modelId,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {

        values: true,

      },

    });


  /*
   * Load all active inputs for the model.
   */
  const inputs =
    await prisma.inputDefinition.findMany({

      where: {

        modelId,

        status: "ACTIVE",

      },

      select: {

        id: true,

      },

    });


  /*
   * Build a lookup of saved values by inputId.
   */
  const savedValuesByInputId =
    new Map<string, string>();


  if (latestSavedModel) {

    for (
      const savedValue
      of latestSavedModel.values
    ) {

      savedValuesByInputId.set(
        savedValue.inputId,
        savedValue.value
      );

    }

  }


  /*
   * Create one scalar ScenarioValue for
   * every active input.
   *
   * Period-aware ScenarioValues use periodId.
   * Existing scenario behaviour remains
   * scalar by explicitly using periodId: null.
   */
  if (inputs.length > 0) {

    await prisma.scenarioValue.createMany({

      data:
        inputs.map(
          (input) => ({

            scenarioId:
              scenario.id,

            inputId:
              input.id,

            periodId:
              null,

            value:
              savedValuesByInputId.get(
                input.id
              ) ?? "",

          })
        ),

    });

  }


  return scenario;

}
export async function duplicateScenario(
  scenarioId: string,
  userId: string
) {
  const source =
    await prisma.scenario.findUnique({
      where: {
        id: scenarioId,
      },
      select: {
        modelId: true,
      },
    });

  if (!source) {
    throw new Error(
      "Scenario not found."
    );
  }

  await requireModelEditAccess(
    source.modelId,
    userId
  );

  return duplicateScenarioRecord({
    scenarioId,
    userId,
  });
}


export async function updateScenario(
  scenarioId: string,
  userId: string,
  name: string,
  description?: string
) {

  const scenario =
    await prisma.scenario.findUnique({

      where: {
        id: scenarioId,
      },

      select: {
        id: true,
        modelId: true,
      },

    });


  if (!scenario) {

    throw new Error(
      "Scenario not found."
    );

  }


  await requireModelEditAccess(
    scenario.modelId,
    userId
  );


  return prisma.scenario.update({

    where: {
      id: scenarioId,
    },

    data: {

      name,

      description:
        description || null,

    },

  });

}


export async function deactivateScenario(
  scenarioId: string,
  userId: string
) {

  const scenario =
    await prisma.scenario.findUnique({

      where: {
        id: scenarioId,
      },

      select: {
        id: true,
        modelId: true,
      },

    });


  if (!scenario) {

    throw new Error(
      "Scenario not found."
    );

  }


  await requireModelEditAccess(
    scenario.modelId,
    userId
  );


  return prisma.scenario.update({

    where: {
      id: scenarioId,
    },

    data: {

      status: "INACTIVE",

    },

  });

}


/**
 * Save one scalar scenario input value.
 *
 * The current scenario API stores one value per
 * input using periodId: null. Period-specific
 * scenario values can continue to use periodId
 * separately.
 */
export async function upsertScenarioValue(
  scenarioId: string,
  inputId: string,
  value: string,
  userId: string
) {

  const scenario =
    await prisma.scenario.findUnique({

      where: {
        id: scenarioId,
      },

      select: {
        id: true,
        modelId: true,
      },

    });


  if (!scenario) {

    throw new Error(
      "Scenario not found."
    );

  }


  await requireModelEditAccess(
    scenario.modelId,
    userId
  );


  const input =
    await prisma.inputDefinition.findFirst({

      where: {

        id: inputId,

        modelId:
          scenario.modelId,

        status: "ACTIVE",

      },

      select: {
        id: true,
      },

    });


  if (!input) {

    throw new Error(
      "Input definition not found."
    );

  }


  /*
   * The Prisma schema now uses the compound
   * key (scenarioId, inputId, periodId).
   *
   * Because this API is currently scalar,
   * explicitly target the period-less value.
   */
  const existing =
    await prisma.scenarioValue.findFirst({

      where: {

        scenarioId,

        inputId,

        periodId:
          null,

      },

    });


  if (existing) {

    return prisma.scenarioValue.update({

      where: {

        id:
          existing.id,

      },

      data: {

        value,

      },

    });

  }


  return prisma.scenarioValue.create({

    data: {

      scenarioId,

      inputId,

      periodId:
        null,

      value,

    },

  });

}
