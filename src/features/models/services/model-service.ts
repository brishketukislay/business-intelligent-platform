import {
  prisma,
} from "@/lib/prisma";

import type {
  BusinessModelInput,
} from "../schemas/model-schema";


export async function getBusinessModels() {

  return prisma.businessModel.findMany({

    orderBy: {
      createdAt: "desc",
    },

  });

}


export async function getBusinessModelById(
  id: string
) {

  return prisma.businessModel.findUnique({

    where: {
      id,
    },

  });

}


export async function createBusinessModel(
  data: BusinessModelInput,
  createdBy: string
) {

  return prisma.businessModel.create({

    data: {

      name: data.name,

      description:
        data.description || null,

      status: data.status,

      createdBy,

    },

  });

}


export async function updateBusinessModel(
  id: string,
  data: BusinessModelInput
) {

  return prisma.businessModel.update({

    where: {
      id,
    },

    data: {

      name: data.name,

      description:
        data.description || null,

      status: data.status,

    },

  });

}


export async function deactivateBusinessModel(
  id: string
) {

  return prisma.businessModel.update({

    where: {
      id,
    },

    data: {
      status: "INACTIVE",
    },

  });

}
