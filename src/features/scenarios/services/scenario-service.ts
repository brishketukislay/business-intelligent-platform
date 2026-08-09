import {
  prisma,
} from "@/lib/prisma";


export async function getScenarios(
  modelId: string,
  userId: string
) {

  return prisma.scenario.findMany({

    where: {

      modelId,

      createdBy: userId,

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

  return prisma.scenario.findFirst({

    where: {

      id: scenarioId,

      createdBy: userId,

    },

    include: {

      values: {

        include: {
          input: true,
        },

      },

    },

  });

}


export async function createScenario(
  modelId: string,
  userId: string,
  name: string,
  description?: string
) {

  const model =
    await prisma.businessModel.findFirst({

      where: {

        id: modelId,

        createdBy: userId,

      },

      select: {
        id: true,
      },

    });


  if (!model) {

    throw new Error(
      "Business model not found or access denied."
    );

  }


  return prisma.scenario.create({

    data: {

      modelId,

      createdBy: userId,

      name,

      description:
        description || null,

    },

  });

}


export async function updateScenario(
  scenarioId: string,
  userId: string,
  name: string,
  description?: string
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


  return prisma.scenario.update({

    where: {

      id: scenarioId,

    },

    data: {

      status: "INACTIVE",

    },

  });

}
