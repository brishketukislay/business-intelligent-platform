"use server";

import { revalidatePath } from "next/cache";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  businessModelSchema,
} from "../schemas/model-schema";

import {
  createBusinessModel,
  updateBusinessModel,
  deactivateBusinessModel,
} from "../services/model-service";


function formDataToModel(
  formData: FormData
) {

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
      ),

  };

}


export async function createBusinessModelAction(
  formData: FormData
) {

  const user =
    await requireCurrentUser();


  const result =
    businessModelSchema.safeParse(
      formDataToModel(formData)
    );


  if (!result.success) {

    return {

      success: false,

      error:
        result.error.flatten(),

    };

  }


  try {

    await createBusinessModel(
      result.data,
      user.id
    );


    revalidatePath(
      "/models"
    );


    return {
      success: true,
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
  id: string,
  formData: FormData
) {

  await requireCurrentUser();


  const result =
    businessModelSchema.safeParse(
      formDataToModel(formData)
    );


  if (!result.success) {

    return {

      success: false,

      error:
        result.error.flatten(),

    };

  }


  try {

    await updateBusinessModel(
      id,
      result.data
    );


    revalidatePath(
      "/models"
    );

    revalidatePath(
      `/models/${id}`
    );


    return {
      success: true,
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
  id: string
) {

  await requireCurrentUser();


  try {

    await deactivateBusinessModel(
      id
    );


    revalidatePath(
      "/models"
    );

    revalidatePath(
      `/models/${id}`
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
