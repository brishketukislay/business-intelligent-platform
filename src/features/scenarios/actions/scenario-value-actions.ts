"use server";


import {
  revalidatePath,
} from "next/cache";


import {
  requireCurrentUser,
} from "@/lib/current-user";


import {
  upsertScenarioValue,
} from "../services/scenario-value-service";


export async function updateScenarioValueAction(
  modelId: string,
  scenarioId: string,
  inputId: string,
  value: string
) {

  const user =
    await requireCurrentUser();


  const cleanValue =
    value.trim();


  if (!cleanValue) {

    return {

      success: false,

      error:
        "Value cannot be empty.",

    };

  }


  try {

    await upsertScenarioValue(
      scenarioId,
      inputId,
      cleanValue,
      user.id
    );


    revalidatePath(
      `/models/${modelId}/scenarios/${scenarioId}`
    );


    return {

      success: true,

    };

  } catch (error) {

    console.error(
      "Failed to update scenario value:",
      error
    );


    return {

      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Unable to update scenario value.",

    };

  }

}
