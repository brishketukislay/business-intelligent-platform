import { z } from "zod";

import {
  MODEL_STATUSES,
} from "../types";

export const businessModelSchema =
  z.object({
    name:
      z.string()
        .trim()
        .min(
          1,
          "Model name is required.",
        )
        .max(
          100,
          "Model name must be 100 characters or less.",
        ),

    description:
      z.string()
        .trim()
        .max(
          500,
          "Description must be 500 characters or less.",
        )
        .optional()
        .or(z.literal("")),

    status:
      z.enum(MODEL_STATUSES),

    itemLabelSingular:
      z.string()
        .trim()
        .min(
          1,
          "Singular item label is required.",
        )
        .max(
          50,
          "Singular item label must be 50 characters or less.",
        ),

    itemLabelPlural:
      z.string()
        .trim()
        .min(
          1,
          "Plural item label is required.",
        )
        .max(
          50,
          "Plural item label must be 50 characters or less.",
        ),
  });

export type BusinessModelInput =
  z.infer<
    typeof businessModelSchema
  >;