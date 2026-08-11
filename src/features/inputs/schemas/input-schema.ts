import { z } from "zod";

export const INPUT_SCOPES = [
  "MODEL",
  "PERIOD",
  "ITEM",
  "ITEM_PERIOD",
] as const;

export type InputScope =
  (typeof INPUT_SCOPES)[number];

export const INPUT_TYPES = [
  "Number",
  "Currency",
  "Percentage",
  "Text",
] as const;

export const inputDefinitionSchema = z.object({
  modelId: z.string().min(1),

  name: z.string()
    .trim()
    .min(1, "Input name is required.")
    .max(100),

  key: z.string()
    .trim()
    .min(1, "Input key is required.")
    .regex(
      /^[a-z0-9_]+$/,
      "Key can only contain lowercase letters, numbers and underscores."
    ),

  type: z.enum(INPUT_TYPES),

  unit: z.string()
    .trim()
    .max(50)
    .optional(),

  category: z.string()
    .trim()
    .max(100)
    .optional(),

  scope: z.enum(INPUT_SCOPES),
});

export type InputDefinitionInput =
  z.infer<typeof inputDefinitionSchema>;