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


export async function getInputPeriodData(
  modelId: string,
  userId: string
) {

  await requireModelAccess(
    modelId,
    userId
  );


  const [
    periods,
    values,
  ] = await Promise.all([

    prisma.modelPeriod.findMany({

      where: {
        modelId,
        status: "ACTIVE",
      },

      orderBy: {
        sortOrder: "asc",
      },

      select: {

        id: true,
        name: true,
        key: true,
        sortOrder: true,

      },

    }),

    prisma.periodValue.findMany({

      where: {

        period: {
          modelId,
        },

        input: {
          modelId,
          status: "ACTIVE",
        },

      },

      select: {

        inputId: true,
        periodId: true,
        value: true,

      },

    }),

  ]);


  return {
    periods,
    values,
  };

}


export async function createInputDefinition(
  data: InputDefinitionInput,
  userId: string
) {

  await requireModelEditAccess(
    data.modelId,
    userId
  );

  return prisma.inputDefinition.create({

    data: {

      modelId: data.modelId,

      name: data.name,

      key: data.key,

      type: data.type,

      scope: data.scope,

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


export async function upsertPeriodValue(
  data: {
    modelId: string;
    inputId: string;
    periodId: string;
    value: string;
  },
  userId: string
) {

  await requireModelEditAccess(
    data.modelId,
    userId
  );


  const [
    input,
    period,
  ] = await Promise.all([

    prisma.inputDefinition.findFirst({

      where: {

        id: data.inputId,

        modelId: data.modelId,

        status: "ACTIVE",

      },

      select: {
        id: true,
      },

    }),

    prisma.modelPeriod.findFirst({

      where: {

        id: data.periodId,

        modelId: data.modelId,

        status: "ACTIVE",

      },

      select: {
        id: true,
      },

    }),

  ]);


  if (!input) {

    throw new Error(
      "Input does not belong to this business model."
    );

  }


  if (!period) {

    throw new Error(
      "Period does not belong to this business model."
    );

  }


  const value =
    data.value.trim();


  /*
   * Blank means "no value entered".
   * Remove an existing PeriodValue rather than
   * storing an empty string.
   */
  if (value === "") {

    await prisma.periodValue.deleteMany({

      where: {

        inputId: data.inputId,

        periodId: data.periodId,

      },

    });

    return null;

  }


  const numericValue =
    Number(value);


  if (!Number.isFinite(numericValue)) {

    throw new Error(
      "Period value must be numeric."
    );

  }


  return prisma.periodValue.upsert({

    where: {

      periodId_inputId: {

        periodId:
          data.periodId,

        inputId:
          data.inputId,

      },

    },

    update: {

      value,

    },

    create: {

      periodId:
        data.periodId,

      inputId:
        data.inputId,

      value,

    },

  });

}
