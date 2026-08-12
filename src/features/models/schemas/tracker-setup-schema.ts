import { z } from "zod";

import {
  MODEL_TYPES,
  PERIOD_TYPE_LABELS,
} from "../types";

const inputTypeSchema = z.enum([
  "Number",
  "Currency",
  "Percentage",
  "Text",
]);

const inputScopeSchema = z.enum([
  "MODEL",
  "PERIOD",
  "ITEM",
  "ITEM_PERIOD",
]);

export const customTrackerInputSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(100),

    type: inputTypeSchema,

    scope: inputScopeSchema,

    unit: z
      .string()
      .trim()
      .max(50)
      .optional()
      .or(z.literal("")),

    category: z
      .string()
      .trim()
      .max(100)
      .optional()
      .or(z.literal("")),
  });

export const trackerSetupSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(1, "A tracker name is required.")
      .max(100),

    description: z
      .string()
      .trim()
      .max(500)
      .optional()
      .or(z.literal("")),

    modelType: z.enum(
      MODEL_TYPES,
    ),

    periodType: z.enum(
      Object.keys(
        PERIOD_TYPE_LABELS,
      ) as [
        keyof typeof PERIOD_TYPE_LABELS,
        ...Array<
          keyof typeof PERIOD_TYPE_LABELS
        >
      ],
    ),

    fiscalYearStartMonth: z
      .number()
      .int()
      .min(1)
      .max(12),

    currency: z
      .string()
      .trim()
      .min(3)
      .max(10),

    inputKeys: z.array(
      z.string().trim(),
    ),

    metricKeys: z.array(
      z.string().trim(),
    ),

    customInputs: z.array(
      customTrackerInputSchema,
    ),
  });

export type TrackerSetupInput =
  z.infer<
    typeof trackerSetupSchema
  >;