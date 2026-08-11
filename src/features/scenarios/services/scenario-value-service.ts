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
   * The current scenario input API uses
   * periodId: null for scalar values.
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

            periodId:
              null,

          },

          select: {

            value:
              true,

          },

        },

      },

      orderBy: {

        createdAt:
          "asc",

      },

    });


  return inputs.map(
    (input:any) => ({

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
   * The current scenario API stores scalar
   * values with periodId: null.
   *
   * The Prisma schema is now period-aware, so
   * use findFirst/update/create instead of the
   * old scenarioId_inputId compound key.
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
