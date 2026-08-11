import { z } from "zod";

export const INPUT_SCOPES = [
  "MODEL",
  "PERIOD",
] as const;

export const INPUT_TYPES = [
  "Number",
  "Currency",
  "Percentage",
  "Text",
] as const;

export const inputDefinitionSchema = z.object({
  modelId: z
    .string()
    .trim()
    .min(1, "Model is required."),

  name: z
    .string()
    .trim()
    .min(1, "Input name is required.")
    .max(
      100,
      "Input name must be 100 characters or less."
    ),

  /*
   * Users do not need to provide this.
   * The server generates it when empty.
   */
  key: z
    .string()
    .trim()
    .max(
      100,
      "Input key must be 100 characters or less."
    )
    .regex(
      /^[a-z0-9_]*$/,
      "Key can only contain lowercase letters, numbers and underscores."
    )
    .optional()
    .or(z.literal("")),

  type: z.enum(INPUT_TYPES),

  unit: z
    .string()
    .trim()
    .max(
      50,
      "Unit must be 50 characters or less."
    )
    .optional()
    .or(z.literal("")),

  category: z
    .string()
    .trim()
    .max(
      100,
      "Category must be 100 characters or less."
    )
    .optional()
    .or(z.literal("")),

  scope: z.enum(INPUT_SCOPES),
});

export type InputDefinitionInput =
  z.infer<typeof inputDefinitionSchema>;