import { z } from "zod";

export const METRIC_TYPES = [
  "Number",
  "Currency",
  "Percentage",
] as const;

export const metricDefinitionSchema =
  z.object({
    modelId:
      z.string()
        .min(
          1,
          "Model is required."
        ),

    name:
      z.string()
        .trim()
        .min(
          1,
          "Metric name is required."
        )
        .max(
          100,
          "Metric name must be 100 characters or less."
        ),

    key:
      z.string()
        .trim()
        .regex(
          /^[a-z0-9_]+$/,
          "Key must contain only lowercase letters, numbers and underscores."
        )
        .max(
          100,
          "Metric key must be 100 characters or less."
        ),

    type:
      z.enum(METRIC_TYPES),

    unit:
      z.string()
        .trim()
        .max(
          50,
          "Unit must be 50 characters or less."
        )
        .optional()
        .or(z.literal("")),

    category:
      z.string()
        .trim()
        .max(
          100,
          "Category must be 100 characters or less."
        )
        .optional()
        .or(z.literal("")),

    formula:
      z.string()
        .trim()
        .min(
          1,
          "Formula is required."
        )
        .max(
          500,
          "Formula must be 500 characters or less."
        ),
  });

export type MetricDefinitionInput =
  z.infer<
    typeof metricDefinitionSchema
  >;
