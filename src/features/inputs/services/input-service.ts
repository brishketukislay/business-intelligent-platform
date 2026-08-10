import {
  prisma,
} from "@/lib/prisma";

import {
  requireModelAccess,
  requireModelEditAccess,
} from "@/lib/model-access";

import type {
  InputDefinitionInput,
} from "../schemas/input-schema";


export async function getInputDefinitions(
  modelId: string,
  userId: string
) {

  /*
   * User may be the owner or have explicit access.
   */
  await requireModelAccess(
    modelId,
    userId
  );


  return prisma.inputDefinition.findMany({

    where: {

      modelId,

      status: "ACTIVE",

    },

    orderBy: {

      createdAt: "asc",

    },

  });

}


export async function createInputDefinition(
  data: InputDefinitionInput,
  userId: string
) {

  /*
   * Creating an input changes the model structure,
   * so VIEW users cannot do this.
   */
  await requireModelEditAccess(
    data.modelId,
    userId
  );


  return prisma.inputDefinition.create({

    data: {

      modelId:
        data.modelId,

      name:
        data.name,

      key:
        data.key,

      type:
        data.type,

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
    await prisma.inputDefinition.findUnique({

      where: {
        id,
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


  /*
   * Make sure the input belongs to the model
   * supplied by the form.
   */
  if (
    input.modelId !== data.modelId
  ) {

    throw new Error(
      "Input does not belong to this business model."
    );

  }


  await requireModelEditAccess(
    input.modelId,
    userId
  );


  return prisma.inputDefinition.update({

    where: {

      id:
        input.id,

    },

    data: {

      name:
        data.name,

      key:
        data.key,

      type:
        data.type,

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
    await prisma.inputDefinition.findUnique({

      where: {
        id,
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


  await requireModelEditAccess(
    input.modelId,
    userId
  );


  return prisma.inputDefinition.update({

    where: {

      id:
        input.id,

    },

    data: {

      status:
        "INACTIVE",

    },

  });

}
