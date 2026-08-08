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

    const updated =
      await updateBusinessModel(
        id,
        result.data,
        user.id
      );


    if (updated.count === 0) {

      return {

        success: false,

        error:
          "Business model not found or access denied.",

      };

    }


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

  const user =
    await requireCurrentUser();


  try {

    const updated =
      await deactivateBusinessModel(
        id,
        user.id
      );


    if (updated.count === 0) {

      return {

        success: false,

        error:
          "Business model not found or access denied.",

      };

    }


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

