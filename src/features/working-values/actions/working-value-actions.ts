"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  upsertWorkingValue,
} from "../services/working-value-service";

export async function updateWorkingValueAction(
  modelId: string,
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
    await upsertWorkingValue(
      inputId,
      cleanValue,
      user.id
    );

    /*
     * The working value is consumed by several
     * server-rendered pages, not only /inputs.
     *
     * In particular, /metrics calls calculateMetrics()
     * which reads WorkingValue directly.
     */
    revalidatePath(
      `/models/${modelId}/inputs`
    );

    revalidatePath(
      `/models/${modelId}/metrics`
    );

    revalidatePath(
      `/models/${modelId}`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Failed to update working value:",
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to save working value.",
    };
  }
}