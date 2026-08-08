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
          "Model name is required."
        )
        .max(
          100,
          "Model name must be 100 characters or less."
        ),

    description:
      z.string()
        .trim()
        .max(
          500,
          "Description must be 500 characters or less."
        )
        .optional()
        .or(z.literal("")),

    status:
      z.enum(MODEL_STATUSES),

  });


export type BusinessModelInput =
  z.infer<
    typeof businessModelSchema
  >;
