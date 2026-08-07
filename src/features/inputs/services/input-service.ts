import {
  prisma,
} from "@/lib/prisma";

import type {
  InputDefinitionInput,
} from "../schemas/input-schema";



export async function getInputDefinitions(
  modelId: string
) {

  return prisma.inputDefinition.findMany({

    where: {
      modelId,
    },

    orderBy: {
      createdAt: "desc",
    },

  });

}



export async function createInputDefinition(
  data: InputDefinitionInput
) {

  return prisma.inputDefinition.create({

    data: {

      modelId: data.modelId,

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
  data: Partial<InputDefinitionInput>
) {

  return prisma.inputDefinition.update({

    where: {
      id,
    },

    data,

  });

}



export async function deactivateInputDefinition(
  id: string
) {

  return prisma.inputDefinition.update({

    where: {
      id,
    },

    data: {
      status: "INACTIVE",
    },

  });

}



export async function getDefaultBusinessModel() {

  return prisma.businessModel.findFirst({

    where: {
      status: "ACTIVE",
    },

    orderBy: {
      createdAt: "asc",
    },

  });

}
