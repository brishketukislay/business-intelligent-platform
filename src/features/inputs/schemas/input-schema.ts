import { z } from "zod";

import {
  INPUT_TYPES,
} from "../types";


export const inputDefinitionSchema =
  z.object({

    modelId: z
      .string()
      .min(1, "Model is required"),


    name: z
      .string()
      .min(
        2,
        "Name must contain at least 2 characters"
      ),


    key: z
      .string()
      .min(
        2,
        "Key must contain at least 2 characters"
      )
      .regex(
        /^[a-z0-9_]+$/,
        "Key must use lowercase letters, numbers and underscores only"
      ),


    type: z.enum(
      INPUT_TYPES
    ),


    unit: z
      .string()
      .optional(),


    category: z
      .string()
      .optional(),

  });


export type InputDefinitionInput =
  z.infer<
    typeof inputDefinitionSchema
  >;
