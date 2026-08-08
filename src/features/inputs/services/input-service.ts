import {
  prisma,
} from "@/lib/prisma";

import type {
  InputDefinitionInput,
} from "../schemas/input-schema";


export async function getInputDefinitions(
  modelId: string,
  userId: string
) {

  return prisma.inputDefinition.findMany({

    where: {
      modelId,

      model: {
        createdBy: userId,
      },
    },

    orderBy: {
      createdAt: "desc",
    },

  });

}


export async function createInputDefinition(
  data: InputDefinitionInput,
  userId: string
) {

  const model =
    await prisma.businessModel.findFirst({

      where: {
        id: data.modelId,
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


  return prisma.inputDefinition.create({

    data: {

      modelId: model.id,

      name: data.name,

      key: data.key,

      type: data.type,

      unit:
        data.unit ??
        null,

      category:
        data.category ??
        null,

    },

  });

}


export async function updateInputDefinition(
  id: string,
  data: InputDefinitionInput,
  userId: string
) {

  const input =
    await prisma.inputDefinition.findFirst({

      where: {
        id,

        model: {
          createdBy: userId,
        },
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


  return prisma.inputDefinition.update({

    where: {
      id: input.id,
    },

    data: {

      name: data.name,

      key: data.key,

      type: data.type,

      unit:
        data.unit ??
        null,

      category:
        data.category ??
        null,

    },

  });

}


export async function deactivateInputDefinition(
  id: string,
  userId: string
) {

  const input =
    await prisma.inputDefinition.findFirst({

      where: {
        id,

        model: {
          createdBy: userId,
        },
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


  return prisma.inputDefinition.update({

    where: {
      id: input.id,
    },

    data: {
      status: "INACTIVE",
    },

  });

}


// export async function getDefaultBusinessModel() {

//   return prisma.businessModel.findFirst({

//     where: {
//       status: "ACTIVE",
//     },

//     orderBy: {
//       createdAt: "asc",
//     },

//   });

// }
