import {
  prisma,
} from "@/lib/prisma";


export type ModelPermission =
  | "VIEW"
  | "EDIT";


export async function getModelAccess(
  modelId: string,
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
    return null;
  }


  const model =
    await prisma.businessModel.findUnique({

      where: {
        id: modelId,
      },

      select: {
        id: true,
        createdBy: true,
        status: true,
      },

    });


  if (!model) {
    return null;
  }


  /*
   * Administrators can access every model.
   */

  if (user.role === "ADMIN") {

    return {
      model,
      permission: "EDIT" as ModelPermission,
      isOwner: model.createdBy === userId,
      isAdmin: true,
    };

  }


  /*
   * Model owner automatically has full access.
   */

  if (model.createdBy === userId) {

    return {
      model,
      permission: "EDIT" as ModelPermission,
      isOwner: true,
      isAdmin: false,
    };

  }


  /*
   * Check explicit sharing.
   */

  const access =
    await prisma.businessModelAccess.findUnique({

      where: {
        modelId_userId: {
          modelId,
          userId,
        },
      },

      select: {
        permission: true,
      },

    });


  if (!access) {
    return null;
  }


  return {
    model,
    permission:
      access.permission === "EDIT"
        ? "EDIT"
        : "VIEW",
    isOwner: false,
    isAdmin: false,
  };

}


export async function canViewModel(
  modelId: string,
  userId: string
) {

  const access =
    await getModelAccess(
      modelId,
      userId
    );


  return !!access;

}


export async function canEditModel(
  modelId: string,
  userId: string
) {

  const access =
    await getModelAccess(
      modelId,
      userId
    );


  if (!access) {
    return false;
  }


  return (
    access.permission === "EDIT"
  );

}


export async function requireModelAccess(
  modelId: string,
  userId: string
) {

  const access =
    await getModelAccess(
      modelId,
      userId
    );


  if (!access) {

    throw new Error(
      "You do not have access to this business model."
    );

  }


  return access;

}


export async function requireModelEditAccess(
  modelId: string,
  userId: string
) {

  const access =
    await getModelAccess(
      modelId,
      userId
    );


  if (!access) {

    throw new Error(
      "You do not have access to this business model."
    );

  }


  if (
    access.permission !== "EDIT"
  ) {

    throw new Error(
      "You do not have permission to edit this business model."
    );

  }


  return access;

}
