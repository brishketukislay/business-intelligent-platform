import {
  prisma,
} from "@/lib/prisma";


export async function getScenarioValues(
  scenarioId: string,
  userId: string
) {

  const scenario =
    await prisma.scenario.findFirst({

      where: {

        id: scenarioId,

        createdBy: userId,

      },

      select: {

        id: true,

      },

    });


  if (!scenario) {

    throw new Error(
      "Scenario not found or access denied."
    );

  }


  return prisma.scenarioValue.findMany({

    where: {

      scenarioId,

      scenario: {
        createdBy: userId,
      },

      input: {
        status: "ACTIVE",
      },

    },

    include: {

      input: true,

    },

    orderBy: {

      input: {
        createdAt: "asc",
      },

    },

  });

}


export async function upsertScenarioValue(
  scenarioId: string,
  inputId: string,
  value: string,
  userId: string
) {

  const input =
    await prisma.inputDefinition.findFirst({

      where: {

        id: inputId,

        status: "ACTIVE",

        model: {

          scenarios: {

            some: {

              id: scenarioId,

              createdBy: userId,

            },

          },

        },

      },

      select: {

        id: true,

      },

    });


  if (!input) {

    throw new Error(
      "Input definition not found or access denied."
    );

  }


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
