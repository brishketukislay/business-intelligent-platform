import {
  prisma,
} from "@/lib/prisma";


export async function getScenarioInputs(
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

        modelId: true,

      },

    });


  if (!scenario) {

    throw new Error(
      "Scenario not found or access denied."
    );

  }


  const inputs =
    await prisma.inputDefinition.findMany({

      where: {

        modelId: scenario.modelId,

        status: "ACTIVE",

      },

      include: {

        scenarioValues: {

          where: {
            scenarioId,
          },

        },

      },

      orderBy: {

        createdAt: "asc",

      },

    });


  return inputs.map(
    (input) => ({

      id: input.id,

      modelId: input.modelId,

      name: input.name,

      key: input.key,

      type: input.type,

      unit: input.unit,

      category: input.category,

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

  const scenario =
    await prisma.scenario.findFirst({

      where: {

        id: scenarioId,

        createdBy: userId,

      },

      select: {

        id: true,

        modelId: true,

      },

    });


  if (!scenario) {

    throw new Error(
      "Scenario not found or access denied."
    );

  }


  const input =
    await prisma.inputDefinition.findFirst({

      where: {

        id: inputId,

        modelId: scenario.modelId,

        status: "ACTIVE",

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
