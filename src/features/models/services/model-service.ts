import {
  prisma,
} from "@/lib/prisma";

import {
  requireModelAccess,
  requireModelEditAccess,
} from "@/lib/model-access";


export async function getBusinessModels(
  userId: string
) {

  const user =
    await prisma.user.findUnique({

      where: {
        id: userId,
      },

      select: {
        id: true,
        role: true,
      },

    });


  if (!user) {
    return [];
  }


  /*
   * Administrators can see every model.
   */
  if (user.role === "ADMIN") {

    return prisma.businessModel.findMany({

      orderBy: {
        createdAt: "desc",
      },

    });

  }


  /*
   * Normal users can see models they own
   * or models shared with them.
   */
  return prisma.businessModel.findMany({

    where: {

      OR: [

        {
          createdBy: userId,
        },

        {
          access: {
            some: {
              userId,
            },
          },
        },

      ],

    },

    orderBy: {
      createdAt: "desc",
    },

  });

}


export async function getBusinessModelById(
  modelId: string,
  userId: string
) {

  const access =
    await requireModelAccess(
      modelId,
      userId
    );


  return prisma.businessModel.findUnique({

    where: {
      id: access.model.id,
    },

  });

}


export async function createBusinessModel(
  data: {
    name: string;
    description?: string;
    status?: "ACTIVE" | "INACTIVE";
  },
  userId: string
) {

  return prisma.businessModel.create({

    data: {

      name:
        data.name,

      description:
        data.description || null,

      status:
        data.status || "ACTIVE",

      createdBy:
        userId,

    },

  });

}


export async function updateBusinessModel(
  modelId: string,
  data: {
    name: string;
    description?: string;
    status?: "ACTIVE" | "INACTIVE";
  },
  userId: string
) {

  await requireModelEditAccess(
    modelId,
    userId
  );


  return prisma.businessModel.update({

    where: {
      id: modelId,
    },

    data: {

      name:
        data.name,

      description:
        data.description || null,

      status:
        data.status || "ACTIVE",

    },

  });

}


export async function deactivateBusinessModel(
  modelId: string,
  userId: string
) {

  await requireModelEditAccess(
    modelId,
    userId
  );


  return prisma.businessModel.update({

    where: {
      id: modelId,
    },

    data: {
      status: "INACTIVE",
    },

  });

}
