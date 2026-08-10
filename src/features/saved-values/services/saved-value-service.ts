import {
  prisma,
} from "@/lib/prisma";

import {
  requireModelAccess,
  requireModelEditAccess,
} from "@/lib/model-access";


export async function getSavedModels(
  modelId: string,
  userId: string
) {

  await requireModelAccess(
    modelId,
    userId
  );


  return prisma.savedModel.findMany({

    where: {
      modelId,
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


export async function getSavedModelById(
  modelId: string,
  savedModelId: string,
  userId: string
) {

  await requireModelAccess(
    modelId,
    userId
  );


  return prisma.savedModel.findFirst({

    where: {

      id: savedModelId,

      modelId,

    },

    include: {

      values: {

        include: {
          input: true,
        },

        orderBy: {
          input: {
            createdAt: "asc",
          },
        },

      },

    },

  });

}


export async function saveWorkingValues(
  modelId: string,
  userId: string
) {

  await requireModelEditAccess(
    modelId,
    userId
  );


  const workingValues =
    await prisma.workingValue.findMany({

      where: {

        userId,

        input: {
          modelId,
        },

      },

      select: {

        inputId: true,

        value: true,

      },

    });


  if (workingValues.length === 0) {

    throw new Error(
      "No working values have been entered."
    );

  }


  const savedModel =
    await prisma.savedModel.create({

      data: {

        modelId,

        createdBy:
          userId,

        name:
          `Snapshot ${new Date().toLocaleString()}`,

        values: {

          create:
            workingValues.map(
              (workingValue) => ({

                modelId,

                inputId:
                  workingValue.inputId,

                value:
                  workingValue.value,

              })
            ),

        },

      },

      include: {

        values: true,

      },

    });


  return savedModel;

}
