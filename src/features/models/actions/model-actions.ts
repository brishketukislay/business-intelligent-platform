"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  businessModelSchema,
  type BusinessModelInput,
} from "../schemas/model-schema";

import {
  createBusinessModel,
  updateBusinessModel,
  deactivateBusinessModel,
} from "../services/model-service";


function formDataToBusinessModel(
  formData: FormData
): BusinessModelInput {

  return {

    name:
      String(
        formData.get("name") ?? ""
      ).trim(),

    description:
      String(
        formData.get("description") ?? ""
      ).trim(),

    status:
      String(
        formData.get("status") ?? "ACTIVE"
      ) as BusinessModelInput["status"],

  };

}


export async function createBusinessModelAction(
  formData: FormData
) {

  const user =
    await requireCurrentUser();


  const data =
    formDataToBusinessModel(
      formData
    );


  const result =
    businessModelSchema.safeParse(
      data
    );


  if (!result.success) {

    return {

      success: false,

      error:
        result.error.flatten(),

    };

  }


  try {

    const model =
      await createBusinessModel(
        result.data,
        user.id
      );


    revalidatePath(
      "/models"
    );


    return {

      success: true,

      modelId:
        model.id,

    };

  } catch (error) {

    console.error(
      "Failed to create business model:",
      error
    );


    return {

      success: false,

      error:
        "Unable to create business model.",

    };

  }

}


export async function updateBusinessModelAction(
  modelId: string,
  formData: FormData
) {

  const user =
    await requireCurrentUser();


  const data =
    formDataToBusinessModel(
      formData
    );


  const result =
    businessModelSchema.safeParse(
      data
    );


  if (!result.success) {

    return {

      success: false,

      error:
        result.error.flatten(),

    };

  }


  try {

    const model =
      await updateBusinessModel(
        modelId,
        result.data,
        user.id
      );


    revalidatePath(
      "/models"
    );

    revalidatePath(
      `/models/${modelId}`
    );

    revalidatePath(
      `/models/${modelId}/edit`
    );


    return {

      success: true,

      modelId:
        model.id,

    };

  } catch (error) {

    console.error(
      "Failed to update business model:",
      error
    );


    return {

      success: false,

      error:
        "Unable to update business model.",

    };

  }

}


export async function deactivateBusinessModelAction(
  modelId: string
) {

  const user =
    await requireCurrentUser();


  try {

    await deactivateBusinessModel(
      modelId,
      user.id
    );


    revalidatePath(
      "/models"
    );

    revalidatePath(
      `/models/${modelId}`
    );

    revalidatePath(
      `/models/${modelId}/edit`
    );


    return {
      success: true,
    };

  } catch (error) {

    console.error(
      "Failed to deactivate business model:",
      error
    );


    return {

      success: false,

      error:
        "Unable to deactivate business model.",

    };

  }

}
