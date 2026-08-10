import {
  prisma,
} from "@/lib/prisma";

import {
  requireModelAccess,
  requireModelEditAccess,
} from "@/lib/model-access";


export async function getWorkingValues(
  modelId: string,
  userId: string
) {

  /*
   * The current user can be:
   *
   * - the model owner
   * - an explicitly shared VIEW user
   * - an explicitly shared EDIT user
   * - an administrator
   *
   * All of them are allowed to READ the model's
   * working values.
   */
  const access =
    await requireModelAccess(
      modelId,
      userId
    );


  /*
   * WorkingValue currently belongs to a User.
   *
   * For shared models we want everybody looking at
   * the same model to see the owner's working values.
   *
   * Therefore we always read the values belonging
   * to the model owner.
   */
  const dataOwnerId =
    access.model.createdBy;


  return prisma.workingValue.findMany({

    where: {

      userId:
        dataOwnerId,

      input: {

        modelId,

        status:
          "ACTIVE",

      },

    },

    include: {

      input: true,

    },

    orderBy: {

      input: {

        createdAt:
          "asc",

      },

    },

  });

}


function validateWorkingValue(
  type: string,
  value: string
) {

  /*
   * Text inputs can contain anything.
   */
  if (
    type === "Text"
  ) {

    return;

  }


  const numericValue =
    Number(value);


  if (
    !Number.isFinite(
      numericValue
    )
  ) {

    throw new Error(
      `${type} input must contain a valid number.`
    );

  }


  if (
    type === "Percentage" &&
    (
      numericValue < 0 ||
      numericValue > 100
    )
  ) {

    throw new Error(
      "Percentage must be between 0 and 100."
    );

  }

}


export async function upsertWorkingValue(
  inputId: string,
  value: string,
  userId: string
) {

  /*
   * The user must have EDIT access because this
   * operation changes shared model data.
   */
  const access =
    await requireModelEditAccessForInput(
      inputId,
      userId
    );


  const input =
    await prisma.inputDefinition.findUnique({

      where: {

        id:
          inputId,

      },

      select: {

        id: true,

        modelId: true,

        type: true,

      },

    });


  if (!input) {

    throw new Error(
      "Input definition not found or access denied."
    );

  }


  /*
   * Make sure the input belongs to the model
   * the access check resolved.
   */
  if (
    input.modelId !==
    access.model.id
  ) {

    throw new Error(
      "Input definition does not belong to this model."
    );

  }


  validateWorkingValue(
    input.type,
    value
  );


  /*
   * IMPORTANT:
   *
   * Save the value against the MODEL OWNER,
   * not the currently logged-in user.
   *
   * This means User B editing a shared model updates
   * the same value User A sees.
   */
  const dataOwnerId =
    access.model.createdBy;


  return prisma.workingValue.upsert({

    where: {

      userId_inputId: {

        userId:
          dataOwnerId,

        inputId,

      },

    },

    create: {

      userId:
        dataOwnerId,

      inputId,

      value,

    },

    update: {

      value,

    },

  });

}


/*
 * Resolve model access from an input ID.
 *
 * We deliberately keep this inside this service so callers
 * only need inputId + userId when saving a value.
 */
async function requireModelEditAccessForInput(
  inputId: string,
  userId: string
) {

  const input =
    await prisma.inputDefinition.findUnique({

      where: {

        id:
          inputId,

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


  return requireModelEditAccess(
    input.modelId,
    userId
  );

}
