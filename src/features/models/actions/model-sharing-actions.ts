"use server";

import {
  prisma,
} from "@/lib/prisma";

import {
  requireModelEditAccess,
} from "@/lib/model-access";


export async function shareModelAction(
  modelId: string,
  userId: string,
  email: string,
  permission: "VIEW" | "EDIT"
) {

  try {

    await requireModelEditAccess(
      modelId,
      userId
    );


    const cleanEmail =
      email.trim().toLowerCase();


    if (!cleanEmail) {

      return {
        success: false,
        error: "Email address is required.",
      };

    }


    const targetUser =
      await prisma.user.findUnique({

        where: {
          email: cleanEmail,
        },

        select: {
          id: true,
          status: true,
        },

      });


    if (!targetUser) {

      return {
        success: false,
        error:
          "No user exists with that email address.",
      };

    }


    if (
      targetUser.status !== "ACTIVE"
    ) {

      return {
        success: false,
        error:
          "Only active users can be given access to a model.",
      };

    }


    if (
      targetUser.id === userId
    ) {

      return {
        success: false,
        error:
          "You cannot share a model with yourself.",
      };

    }


    const model =
      await prisma.businessModel.findUnique({

        where: {
          id: modelId,
        },

        select: {
          id: true,
          createdBy: true,
        },

      });


    if (!model) {

      return {
        success: false,
        error:
          "Business model not found.",
      };

    }


    if (
      model.createdBy === targetUser.id
    ) {

      return {
        success: false,
        error:
          "The model owner already has full access.",
      };

    }


    await prisma.businessModelAccess.upsert({

      where: {

        modelId_userId: {
          modelId,
          userId: targetUser.id,
        },

      },

      create: {

        modelId,

        userId:
          targetUser.id,

        permission,

      },

      update: {

        permission,

      },

    });


    return {
      success: true,
    };

  } catch (error) {

    console.error(
      "shareModelAction:",
      error
    );


    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to share this model.",
    };

  }

}


export async function updateModelShareAction(
  modelId: string,
  userId: string,
  targetUserId: string,
  permission: "VIEW" | "EDIT"
) {

  try {

    await requireModelEditAccess(
      modelId,
      userId
    );


    const access =
      await prisma.businessModelAccess.findUnique({

        where: {

          modelId_userId: {
            modelId,
            userId: targetUserId,
          },

        },

      });


    if (!access) {

      return {
        success: false,
        error:
          "Model is not shared with this user.",
      };

    }


    await prisma.businessModelAccess.update({

      where: {
        id: access.id,
      },

      data: {
        permission,
      },

    });


    return {
      success: true,
    };

  } catch (error) {

    console.error(
      "updateModelShareAction:",
      error
    );


    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update permission.",
    };

  }

}


export async function removeModelShareAction(
  modelId: string,
  userId: string,
  targetUserId: string
) {

  try {

    await requireModelEditAccess(
      modelId,
      userId
    );


    await prisma.businessModelAccess.delete({

      where: {

        modelId_userId: {
          modelId,
          userId: targetUserId,
        },

      },

    });


    return {
      success: true,
    };

  } catch (error) {

    console.error(
      "removeModelShareAction:",
      error
    );


    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to remove access.",
    };

  }

}


export async function getModelShares(
  modelId: string,
  userId: string
) {

  await requireModelEditAccess(
    modelId,
    userId
  );


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
