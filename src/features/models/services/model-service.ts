import {
  prisma,
} from "@/lib/prisma";

import type {
  BusinessModelInput,
} from "../schemas/model-schema";


export async function getBusinessModels(
  userId: string
) {

  return prisma.businessModel.findMany({

    where: {
      createdBy: userId,
    },

    orderBy: {
      createdAt: "desc",
    },

  });

}


export async function getBusinessModelById(
  id: string,
  userId: string
) {

  return prisma.businessModel.findFirst({

    where: {
      id,
      createdBy: userId,
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
  data: BusinessModelInput,
  userId: string
) {

  return prisma.businessModel.updateMany({

    where: {
      id,
      createdBy: userId,
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
  id: string,
  userId: string
) {

  return prisma.businessModel.updateMany({

    where: {
      id,
      createdBy: userId,
    },

    data: {
      status: "INACTIVE",
    },

  });

}
