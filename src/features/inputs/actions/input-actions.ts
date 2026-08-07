"use server";

import { revalidatePath } from "next/cache";

import {
  inputDefinitionSchema,
  type InputDefinitionInput,
} from "../schemas/input-schema";

import {
  createInputDefinition,
  updateInputDefinition,
  deactivateInputDefinition,
} from "../services/input-service";



function formDataToInputDefinition(
  formData: FormData
): InputDefinitionInput {

  return {

    modelId:
      String(
        formData.get("modelId") ?? ""
      ),

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
      "Create input validation failed:",
      result.error.flatten()
    );

    return {
      success: false,
      error: result.error.flatten(),
    };

  }


  try {

    await createInputDefinition(
      result.data
    );


    revalidatePath(
      "/admin/inputs"
    );


    return {
      success: true,
    };

  } catch (error) {

    console.error(
      "Failed to create input definition:",
      error
    );


    return {
      success: false,
      error:
        "Unable to create input definition",
    };

  }

}



export async function updateInputAction(
  id: string,
  formData: FormData
) {

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
      error: result.error.flatten(),
    };

  }


  try {

    await updateInputDefinition(
      id,
      result.data
    );


    revalidatePath(
      "/admin/inputs"
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
        "Unable to update input definition",
    };

  }

}



export async function deactivateInputAction(
  id: string
) {

  try {

    await deactivateInputDefinition(
      id
    );


    revalidatePath(
      "/admin/inputs"
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
        "Unable to deactivate input definition",
    };

  }

}
