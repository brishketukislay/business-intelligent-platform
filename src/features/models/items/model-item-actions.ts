"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  createModelItem,
  updateModelItem,
  deactivateModelItem,
  upsertModelItemValue,
} from "./model-item-service";

export async function createModelItemAction(
  modelId: string,
  name: string
) {
  const user =
    await requireCurrentUser();

  const cleanName =
    name.trim();

  if (!cleanName) {
    return {
      success: false,
      error: "Item name is required.",
    };
  }

  const key =
    cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  if (!key) {
    return {
      success: false,
      error: "Unable to generate an item key.",
    };
  }

  try {
    const item =
      await createModelItem(
        modelId,
        cleanName,
        key,
        user.id
      );

    revalidatePath(
      `/models/${modelId}/items`
    );

    return {
      success: true,
      itemId: item.id,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to create item.",
    };
  }
}

export async function updateModelItemAction(
  itemId: string,
  name: string,
  key: string
) {
  const user =
    await requireCurrentUser();

  try {
    const item =
      await updateModelItem(
        itemId,
        name.trim(),
        key.trim(),
        user.id
      );

    revalidatePath(
      `/models/${item.modelId}/items`
    );

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update item.",
    };
  }
}

export async function deactivateModelItemAction(
  itemId: string
) {
  const user =
    await requireCurrentUser();

  try {
    const item =
      await deactivateModelItem(
        itemId,
        user.id
      );

    revalidatePath(
      `/models/${item.modelId}/items`
    );

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to remove item.",
    };
  }
}

export async function upsertModelItemValueAction(
  modelId: string,
  itemId: string,
  inputId: string,
  periodId: string | null,
  value: string
) {
  const user =
    await requireCurrentUser();

  try {
    await upsertModelItemValue(
      {
        modelId,
        itemId,
        inputId,
        periodId,
        value,
      },
      user.id
    );

    revalidatePath(
      `/models/${modelId}/items`
    );

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to save value.",
    };
  }
}