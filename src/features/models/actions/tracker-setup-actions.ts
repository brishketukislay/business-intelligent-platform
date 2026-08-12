"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  trackerSetupSchema,
} from "../schemas/tracker-setup-schema";

import {
  createTracker,
} from "../services/tracker-setup-service";

export async function createTrackerAction(
  payload: unknown,
) {
  const user =
    await requireCurrentUser();

  const parsed =
    trackerSetupSchema.safeParse(
      payload,
    );

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]
          ?.message ??
        "Please check the tracker configuration.",
    };
  }

  try {
    const model =
      await createTracker(
        user.id,
        parsed.data,
      );

    revalidatePath(
      "/models",
    );

    revalidatePath(
      "/dashboard",
    );

    return {
      success: true,
      modelId: model.id,
    };
  } catch (error) {
    console.error(
      "Failed to create tracker:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to create tracker.",
    };
  }
}