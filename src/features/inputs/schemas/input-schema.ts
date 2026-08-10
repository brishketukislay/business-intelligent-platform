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

  modelId:
    z.string().min(1),

  name:
    z.string()
      .trim()
      .min(1, "Input name is required."),

  key:
    z.string()
      .trim()
      .min(1, "Input key is required.")
      .regex(
        /^[a-z0-9_]+$/,
        "Key can only contain lowercase letters, numbers and underscores."
      ),

  type:
    z.enum(INPUT_TYPES),

  unit:
    z.string()
      .trim()
      .optional(),

  category:
    z.string()
      .trim()
      .optional(),

  scope:
    z.enum(INPUT_SCOPES),

});


export type InputDefinitionInput =
  z.infer<typeof inputDefinitionSchema>;