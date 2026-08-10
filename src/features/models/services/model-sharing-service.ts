import {
  prisma,
} from "@/lib/prisma";

import {
  requireModelEditAccess,
} from "@/lib/model-access";


export type ModelPermission =
  | "VIEW"
  | "EDIT";


// export type ModelShare = {
//   id: string;
//   modelId: string;
//   userId: string;
//   permission: ModelPermission;
//   createdAt: Date;
//   user: {
//     id: string;
//     email: string;
//     name: string | null;
//   };
// };


export async function shareModel(
  modelId: string,
  ownerUserId: string,
  email: string,
  permission: ModelPermission = "VIEW"
) {

  await requireModelEditAccess(
    modelId,
    ownerUserId
  );


  const cleanEmail =
    email.trim().toLowerCase();


  if (!cleanEmail) {

    throw new Error(
      "Email address is required."
    );

  }


  const user =
    await prisma.user.findUnique({

      where: {
        email: cleanEmail,
      },

      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      },

    });


  if (!user) {

    throw new Error(
      "No user exists with that email address."
    );

  }


  if (
    user.status !== "ACTIVE"
  ) {

    throw new Error(
      "This user does not have an active account."
    );

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

    throw new Error(
      "Business model not found."
    );

  }


  if (
    model.createdBy === user.id
  ) {

    throw new Error(
      "The model owner already has full access."
    );

  }


  return prisma.businessModelAccess.upsert({

    where: {

      modelId_userId: {
        modelId,
        userId: user.id,
      },

    },

    create: {

      modelId,

      userId:
        user.id,

      permission,

    },

    update: {

      permission,

    },

    include: {

      user: {

        select: {

          id: true,

          email: true,

          name: true,

        },

      },

    },

  });

}


// export async function getModelShares(
//   modelId: string,
//   userId: string
// ): Promise<ModelShare[]> {

//   await requireModelEditAccess(
//     modelId,
//     userId
//   );


//   const shares =
//     await prisma.businessModelAccess.findMany({

//       where: {
//         modelId,
//       },

//       include: {

//         user: {

//           select: {

//             id: true,

//             email: true,

//             name: true,

//           },

//         },

//       },

//       orderBy: {
//         createdAt: "asc",
//       },

//     });


//   return shares.map(
//     (share) => ({

//       id:
//         share.id,

//       modelId:
//         share.modelId,

//       userId:
//         share.userId,

//       permission:
//         share.permission as ModelPermission,

//       createdAt:
//         share.createdAt,

//       user:
//         share.user,

//     })
//   );

// }


export async function updateModelShare(
  modelId: string,
  ownerUserId: string,
  sharedUserId: string,
  permission: ModelPermission
) {

  await requireModelEditAccess(
    modelId,
    ownerUserId
  );


  return prisma.businessModelAccess.update({

    where: {

      modelId_userId: {
        modelId,
        userId: sharedUserId,
      },

    },

    data: {

      permission,

    },

    include: {

      user: {

        select: {

          id: true,

          email: true,

          name: true,

        },

      },

    },

  });

}


export async function removeModelShare(
  modelId: string,
  ownerUserId: string,
  sharedUserId: string
) {

  await requireModelEditAccess(
    modelId,
    ownerUserId
  );


  return prisma.businessModelAccess.delete({

    where: {

      modelId_userId: {
        modelId,
        userId: sharedUserId,
      },

    },

  });

}