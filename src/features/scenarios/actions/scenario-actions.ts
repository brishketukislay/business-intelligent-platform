"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  createScenario,
  duplicateScenario,
  updateScenario,
  deactivateScenario,
  upsertScenarioValue,
} from "../services/scenario-service";


export async function createScenarioAction(
  modelId: string,
  name: string,
  description: string
) {

  const user =
    await requireCurrentUser();


  const cleanName =
    name.trim();

  const cleanDescription =
    description.trim();


  if (!cleanName) {

    return {

      success: false,

      error:
        "Scenario name is required.",

    };

  }


  try {

    const scenario =
      await createScenario(
        modelId,
        user.id,
        cleanName,
        cleanDescription
      );


    revalidatePath(
      `/models/${modelId}/scenarios`
    );

    revalidatePath(
      `/models/${modelId}`
    );


    return {

      success: true,

      scenarioId:
        scenario.id,

    };


  } catch (error) {

    console.error(
      "Failed to create scenario:",
      error
    );


    return {

      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Unable to create scenario.",

    };

  }

}
export async function duplicateScenarioAction(
  modelId: string,
  scenarioId: string
) {
  const user =
    await requireCurrentUser();

  if (
    !modelId.trim() ||
    !scenarioId.trim()
  ) {
    return {
      success: false,
      error:
        "Scenario could not be copied.",
    };
  }

  try {
    const scenario =
      await duplicateScenario(
        scenarioId,
        user.id
      );

    revalidatePath(
      `/models/${modelId}/scenarios`
    );

    revalidatePath(
      `/models/${modelId}/scenarios/${scenario.id}`
    );

    return {
      success: true,
      scenarioId:
        scenario.id,
    };
  } catch (error) {
    console.error(
      "Failed to duplicate scenario:",
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to copy scenario.",
    };
  }
}


export async function updateScenarioAction(
  modelId: string,
  scenarioId: string,
  name: string,
  description: string
) {

  const user =
    await requireCurrentUser();


  const cleanName =
    name.trim();

  const cleanDescription =
    description.trim();


  if (!cleanName) {

    return {

      success: false,

      error:
        "Scenario name is required.",

    };

  }


  try {

    await updateScenario(
      scenarioId,
      user.id,
      cleanName,
      cleanDescription
    );


    revalidatePath(
      `/models/${modelId}/scenarios`
    );

    revalidatePath(
      `/models/${modelId}/scenarios/${scenarioId}`
    );


    return {

      success: true,

    };

  } catch (error) {

    console.error(
      "Failed to update scenario:",
      error
    );


    return {

      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Unable to update scenario.",

    };

  }

}


export async function deactivateScenarioAction(
  modelId: string,
  scenarioId: string
) {

  const user =
    await requireCurrentUser();


  try {

    await deactivateScenario(
      scenarioId,
      user.id
    );


    revalidatePath(
      `/models/${modelId}/scenarios`
    );

    revalidatePath(
      `/models/${modelId}`
    );


    return {

      success: true,

    };

  } catch (error) {

    console.error(
      "Failed to deactivate scenario:",
      error
    );


    return {

      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Unable to deactivate scenario.",

    };

  }

}


/**
 * Save a scenario input value.
 *
 * This is called after the user finishes editing,
 * rather than on every keystroke.
 */
export async function saveScenarioValue(
  input: {
    modelId: string;
    scenarioId: string;
    inputId: string;
    value: string;
  }
) {

  const user =
    await requireCurrentUser();


  try {

    await upsertScenarioValue(
      input.scenarioId,
      input.inputId,
      input.value,
      user.id
    );


    revalidatePath(
      `/models/${input.modelId}/scenarios/${input.scenarioId}`
    );


    return {

      success: true,

    };

  } catch (error) {

    console.error(
      "Failed to save scenario value:",
      error
    );


    return {

      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Unable to save scenario value.",

    };

  }

}
