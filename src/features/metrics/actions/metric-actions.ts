"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  metricDefinitionSchema,
  type MetricDefinitionInput,
} from "../schemas/metric-schema";

import {
  createMetricDefinition,
  updateMetricDefinition,
  deactivateMetricDefinition,
  getMetricFormulaContext,
} from "../services/metric-service";

function formDataToMetricDefinition(
  formData: FormData
): MetricDefinitionInput {
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
    ) as MetricDefinitionInput["type"],

    unit:
      String(
        formData.get("unit") ?? ""
      ).trim() || undefined,

    category:
      String(
        formData.get("category") ?? ""
      ).trim() || undefined,

    formula: String(
      formData.get("formula") ?? ""
    ).trim(),
  };
}

function errorMessage(
  error: unknown,
  fallback: string
) {
  return error instanceof Error
    ? error.message
    : fallback;
}

export async function getMetricFormulaContextAction(
  modelId: string
) {
  const user =
    await requireCurrentUser();

  try {
    return {
      success: true,
      data:
        await getMetricFormulaContext(
          modelId,
          user.id
        ),
    };
  } catch (error) {
    console.error(
      "Failed to load formula context:",
      error
    );

    return {
      success: false,
      error:
        errorMessage(
          error,
          "Unable to load formula references."
        ),
    };
  }
}

export async function createMetricAction(
  formData: FormData
) {
  const user =
    await requireCurrentUser();

  const result =
    metricDefinitionSchema.safeParse(
      formDataToMetricDefinition(
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
    const metric =
      await createMetricDefinition(
        result.data,
        user.id
      );

    revalidatePath(
      `/models/${metric.modelId}/metrics`
    );

    revalidatePath(
      `/models/${metric.modelId}/edit`
    );

    return {
      success: true,
      metricId: metric.id,
      key: metric.key,
    };
  } catch (error) {
    console.error(
      "Failed to create metric:",
      error
    );

    return {
      success: false,
      error:
        errorMessage(
          error,
          "Unable to create metric definition."
        ),
    };
  }
}

export async function updateMetricAction(
  id: string,
  formData: FormData
) {
  const user =
    await requireCurrentUser();

  const result =
    metricDefinitionSchema.safeParse(
      formDataToMetricDefinition(
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
    const metric =
      await updateMetricDefinition(
        id,
        result.data,
        user.id
      );

    revalidatePath(
      `/models/${metric.modelId}/metrics`
    );

    revalidatePath(
      `/models/${metric.modelId}/edit`
    );

    return {
      success: true,
      key: metric.key,
    };
  } catch (error) {
    console.error(
      "Failed to update metric:",
      error
    );

    return {
      success: false,
      error:
        errorMessage(
          error,
          "Unable to update metric definition."
        ),
    };
  }
}

export async function deactivateMetricAction(
  id: string,
  modelId: string
) {
  const user =
    await requireCurrentUser();

  try {
    await deactivateMetricDefinition(
      id,
      user.id
    );

    revalidatePath(
      `/models/${modelId}/metrics`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Failed to deactivate metric:",
      error
    );

    return {
      success: false,
      error:
        errorMessage(
          error,
          "Unable to deactivate metric definition."
        ),
    };
  }
}