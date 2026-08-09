import {
prisma,
} from "@/lib/prisma";

export async function getSavedModels(
modelId: string,
userId: string
) {

return prisma.savedModel.findMany({

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
export async function getSavedModelById(
  modelId: string,
  savedModelId: string,
  userId: string
) {

  return prisma.savedModel.findFirst({

    where: {

      id: savedModelId,

      modelId,

      createdBy: userId,

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

    createdBy: userId,

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