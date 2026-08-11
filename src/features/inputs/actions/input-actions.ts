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
    modelId: String(
      formData.get("modelId") ?? ""
    ).trim(),

    name: String(
      formData.get("name") ?? ""
    ).trim(),

    key: String(
      formData.get("key") ?? ""
    ).trim(),

    type: String(
      formData.get("type") ?? "Number"
    ) as InputDefinitionInput["type"],

    scope: String(
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

function getActionError(
  error: unknown,
  fallback: string
): string {
  return error instanceof Error
    ? error.message
    : fallback;
}

export async function createInputAction(
  formData: FormData
) {
  const user =
    await requireCurrentUser();

  const result =
    inputDefinitionSchema.safeParse(
      formDataToInputDefinition(
        formData
      )
    );

  if (!result.success) {
    return {
      success: false,
      error:
        result.error.flatten()
          .fieldErrors,
    };
  }

  try {
    const input =
      await createInputDefinition(
        result.data,
        user.id
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
      key: input.key,
    };
  } catch (error) {
    console.error(
      "Failed to create input:",
      error
    );

    return {
      success: false,
      error: getActionError(
        error,
        "Unable to create input definition."
      ),
    };
  }
}

export async function updateInputAction(
  id: string,
  formData: FormData
) {
  const user =
    await requireCurrentUser();

  const result =
    inputDefinitionSchema.safeParse(
      formDataToInputDefinition(
        formData
      )
    );

  if (!result.success) {
    return {
      success: false,
      error:
        result.error.flatten()
          .fieldErrors,
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

    revalidatePath(
      `/models/${input.modelId}/edit`
    );

    return {
      success: true,
      key: input.key,
    };
  } catch (error) {
    console.error(
      "Failed to update input:",
      error
    );

    return {
      success: false,
      error: getActionError(
        error,
        "Unable to update input definition."
      ),
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
      "Failed to deactivate input:",
      error
    );

    return {
      success: false,
      error: getActionError(
        error,
        "Unable to deactivate input definition."
      ),
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

  if (
    !modelId.trim() ||
    !inputId.trim() ||
    !periodId.trim()
  ) {
    return {
      success: false,
      error:
        "Model, input and period are required.",
    };
  }

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

    revalidatePath(
      `/models/${modelId}/scenarios`
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
      error: getActionError(
        error,
        "Unable to save period value."
      ),
    };
  }
}