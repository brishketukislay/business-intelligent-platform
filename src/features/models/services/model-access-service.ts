import {
  prisma,
} from "@/lib/prisma";

import {
  requireModelAccess,
} from "@/lib/model-access";


export async function getModelAccessList(
  modelId: string,
  userId: string
) {

  const access =
    await requireModelAccess(
      modelId,
      userId
    );


  /*
   * Only the owner or admin should manage sharing.
   */

  if (
    !access.isOwner &&
    !access.isAdmin
  ) {

    throw new Error(
      "Only the model owner or an administrator can manage access."
    );

  }


  return prisma.businessModelAccess.findMany({

    where: {
      modelId,
    },

    include: {

      user: {

        select: {

          id: true,

          name: true,

          email: true,

          role: true,

          status: true,

        },

      },

    },

    orderBy: {
      createdAt: "asc",
    },

  });

}


export async function grantModelAccess(
  modelId: string,
  ownerId: string,
  targetUserId: string,
  permission: "VIEW" | "EDIT"
) {

  const access =
    await requireModelAccess(
      modelId,
      ownerId
    );


  if (
    !access.isOwner &&
    !access.isAdmin
  ) {

    throw new Error(
      "Only the model owner or an administrator can share this model."
    );

  }


  const targetUser =
    await prisma.user.findUnique({

      where: {
        id: targetUserId,
      },

      select: {
        id: true,
        status: true,
      },

    });


  if (!targetUser) {

    throw new Error(
      "User not found."
    );

  }


  if (
    targetUser.status !== "ACTIVE"
  ) {

    throw new Error(
      "Only active users can be given access."
    );

  }


  const model =
    await prisma.businessModel.findUnique({

      where: {
        id: modelId,
      },

      select: {
        createdBy: true,
      },

    });


  if (!model) {

    throw new Error(
      "Business model not found."
    );

  }


  /*
   * Owner already has implicit access.
   */

  if (
    model.createdBy === targetUserId
  ) {

    throw new Error(
      "The model owner already has full access."
    );

  }


  return prisma.businessModelAccess.upsert({

    where: {

      modelId_userId: {
        modelId,
        userId: targetUserId,
      },

    },

    create: {

      modelId,

      userId: targetUserId,

      permission,

    },

    update: {

      permission,

    },

  });

}


export async function revokeModelAccess(
  modelId: string,
  ownerId: string,
  targetUserId: string
) {

  const access =
    await requireModelAccess(
      modelId,
      ownerId
    );


  if (
    !access.isOwner &&
    !access.isAdmin
  ) {

    throw new Error(
      "Only the model owner or an administrator can revoke access."
    );

  }


  await prisma.businessModelAccess.deleteMany({

    where: {

      modelId,

      userId: targetUserId,

    },

  });

}


export async function updateModelAccess(
  modelId: string,
  ownerId: string,
  targetUserId: string,
  permission: "VIEW" | "EDIT"
) {

  const access =
    await requireModelAccess(
      modelId,
      ownerId
    );


  if (
    !access.isOwner &&
    !access.isAdmin
  ) {

    throw new Error(
      "Only the model owner or an administrator can change access."
    );

  }


  const existing =
    await prisma.businessModelAccess.findUnique({

      where: {

        modelId_userId: {
          modelId,
          userId: targetUserId,
        },

      },

    });


  if (!existing) {

    throw new Error(
      "User does not currently have access."
    );

  }


  return prisma.businessModelAccess.update({

    where: {
      id: existing.id,
    },

    data: {
      permission,
    },

  });

}
