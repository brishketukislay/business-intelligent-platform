"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  inputDefinitionSchema,
  type InputDefinitionInput,
} from "../schemas/input-schema";

import {
  createInputDefinition,
  updateInputDefinition,
  deactivateInputDefinition,
  upsertPeriodValue,
} from "../services/input-service";


function formDataToInputDefinition(
  formData: FormData
): InputDefinitionInput {

  return {

    modelId:
      String(
        formData.get("modelId") ?? ""
      ).trim(),

    name:
      String(
        formData.get("name") ?? ""
      ).trim(),

    key:
      String(
        formData.get("key") ?? ""
      ).trim(),

    type:
      String(
        formData.get("type") ?? "Number"
      ) as InputDefinitionInput["type"],

    scope:
      String(
        formData.get("scope") ?? "MODEL"
      ) as InputDefinitionInput["scope"],

    unit:
      String(
        formData.get("unit") ?? ""
      ).trim() || undefined,

    category:
      String(
        formData.get("category") ?? ""
      ).trim() || undefined,

  };

}


export async function createInputAction(
  formData: FormData
) {

  console.log(
    "CREATE INPUT FORM DATA:",
    Object.fromEntries(formData.entries())
  );


  const user =
    await requireCurrentUser();


  const data =
    formDataToInputDefinition(
      formData
    );


  console.log(
    "CREATE INPUT DATA:",
    data
  );


  const result =
    inputDefinitionSchema.safeParse(
      data
    );


  if (!result.success) {

    console.error(
      "CREATE INPUT VALIDATION ERROR:",
      result.error.flatten()
    );

    return {

      success: false,

      error:
        result.error.flatten().fieldErrors,

    };

  }


  try {

    console.log(
      "CREATING INPUT:",
      result.data
    );


    const input =
      await createInputDefinition(
        result.data,
        user.id
      );


    console.log(
      "INPUT CREATED:",
      input
    );


    revalidatePath(
      `/models/${input.modelId}/inputs`
    );

    revalidatePath(
      `/models/${input.modelId}/edit`
    );


    return {
      success: true,
      inputId: input.id,
    };

  } catch (error: unknown) {

    console.error(
      "CREATE INPUT DATABASE ERROR:",
      error
    );


    if (
      error &&
      typeof error === "object" &&
      "code" in error
    ) {

      console.error(
        "PRISMA ERROR CODE:",
        error.code
      );

    }


    return {

      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Unable to create input definition.",

    };

  }

}


export async function updateInputAction(
  id: string,
  formData: FormData
) {

  const user =
    await requireCurrentUser();


  const data =
    formDataToInputDefinition(
      formData
    );


  const result =
    inputDefinitionSchema.safeParse(
      data
    );


  if (!result.success) {

    console.error(
      "Update input validation failed:",
      result.error.flatten()
    );

    return {

      success: false,

      error:
        result.error.flatten(),

    };

  }


  try {

    const input =
      await updateInputDefinition(
        id,
        result.data,
        user.id
      );


    revalidatePath(
      `/models/${input.modelId}/inputs`
    );


    return {
      success: true,
    };

  } catch (error) {

    console.error(
      "Failed to update input definition:",
      error
    );


    return {

      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Unable to update input definition.",

    };

  }

}


export async function deactivateInputAction(
  id: string
) {

  const user =
    await requireCurrentUser();


  try {

    const input =
      await deactivateInputDefinition(
        id,
        user.id
      );


    revalidatePath(
      `/models/${input.modelId}/inputs`
    );


    return {
      success: true,
    };

  } catch (error) {

    console.error(
      "Failed to deactivate input definition:",
      error
    );


    return {

      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Unable to deactivate input definition.",

    };

  }

}


export async function upsertPeriodValueAction(
  modelId: string,
  inputId: string,
  periodId: string,
  value: string
) {

  const user =
    await requireCurrentUser();


  try {

    await upsertPeriodValue(
      {
        modelId,
        inputId,
        periodId,
        value,
      },
      user.id
    );


    revalidatePath(
      `/models/${modelId}/inputs`
    );

    revalidatePath(
      `/models/${modelId}/metrics`
    );


    return {
      success: true,
    };

  } catch (error) {

    console.error(
      "Failed to save period value:",
      error
    );


    return {

      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Unable to save period value.",

    };

  }

}