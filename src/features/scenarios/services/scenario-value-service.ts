import {
  prisma,
} from "@/lib/prisma";

import {
  requireModelAccess,
  requireModelEditAccess,
} from "@/lib/model-access";


export async function getScenarioInputs(
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
        status: true,
      },

    });


  if (!scenario) {

    throw new Error(
      "Scenario not found."
    );

  }


  if (
    scenario.status !== "ACTIVE"
  ) {

    throw new Error(
      "Scenario is inactive."
    );

  }


  /*
   * The user can be:
   *
   * - model owner
   * - shared VIEW user
   * - shared EDIT user
   * - administrator
   */
  await requireModelAccess(
    scenario.modelId,
    userId
  );


  /*
   * Load every active input belonging to the
   * scenario's model.
   *
   * ScenarioValue contains the actual values
   * for this scenario.
   */
  const inputs =
    await prisma.inputDefinition.findMany({

      where: {

        modelId:
          scenario.modelId,

        status:
          "ACTIVE",

      },

      include: {

        scenarioValues: {

          where: {

            scenarioId:
              scenario.id,

          },

          select: {

            value: true,

          },

        },

      },

      orderBy: {

        createdAt:
          "asc",

      },

    });


  return inputs.map(
    (input) => ({

      id:
        input.id,

      modelId:
        input.modelId,

      name:
        input.name,

      key:
        input.key,

      type:
        input.type,

      unit:
        input.unit,

      category:
        input.category,

      value:
        input.scenarioValues[0]?.value ??
        "",

    })
  );

}


export async function upsertScenarioValue(
  scenarioId: string,
  inputId: string,
  value: string,
  userId: string
) {

  /*
   * Find the scenario first.
   *
   * Do NOT require createdBy === userId.
   *
   * A shared EDIT user must be able to modify
   * scenarios created by the model owner or
   * another shared EDIT user.
   */
  const scenario =
    await prisma.scenario.findUnique({

      where: {

        id:
          scenarioId,

      },

      select: {

        id:
          true,

        modelId:
          true,

        status:
          true,

      },

    });


  if (!scenario) {

    throw new Error(
      "Scenario not found."
    );

  }


  if (
    scenario.status !== "ACTIVE"
  ) {

    throw new Error(
      "Scenario is inactive."
    );

  }


  /*
   * Editing scenario values requires EDIT
   * permission on the model.
   */
  await requireModelEditAccess(
    scenario.modelId,
    userId
  );


  /*
   * Make absolutely sure the input belongs
   * to the same model as the scenario.
   */
  const input =
    await prisma.inputDefinition.findFirst({

      where: {

        id:
          inputId,

        modelId:
          scenario.modelId,

        status:
          "ACTIVE",

      },

      select: {

        id:
          true,

        type:
          true,

      },

    });


  if (!input) {

    throw new Error(
      "Input definition not found."
    );

  }


  /*
   * Save the value against the scenario.
   *
   * This means all users with access to the
   * model see the same scenario value.
   */
  return prisma.scenarioValue.upsert({

    where: {

      scenarioId_inputId: {

        scenarioId,

        inputId,

      },

    },

    create: {

      scenarioId,

      inputId,

      value,

    },

    update: {

      value,

    },

  });

}
