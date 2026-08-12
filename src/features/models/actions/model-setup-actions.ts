"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCurrentUser } from "@/lib/current-user";

import {
  createTracker,
} from "../services/model-setup-service";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(100),

  description: z
    .string()
    .trim()
    .max(500)
    .optional(),

  modelType: z.enum([
    "COMPANY",
    "PROJECT",
    "INDIVIDUAL",
    "SALES",
    "CUSTOMER",
    "OPERATIONS",
    "CUSTOM",
  ]),

  periodType: z.enum([
    "MONTH",
    "QUARTER",
    "YEAR",
  ]),

  fiscalYearStartMonth: z
    .number()
    .int()
    .min(1)
    .max(12),

  currency: z.string().min(3).max(10),

  inputKeys: z.array(z.string()),

  metricKeys: z.array(z.string()),
});

export async function createTrackerAction(
  payload: unknown,
) {
  const user =
    await requireCurrentUser();

  const parsed =
    schema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please check the tracker configuration.",
    };
  }

  try {
    const model =
      await createTracker(
        user.id,
        parsed.data,
      );

    revalidatePath("/models");
    revalidatePath("/dashboard");

    return {
      success: true,
      modelId: model.id,
    };
  } catch (error) {
    console.error(
      "Failed to create tracker",
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