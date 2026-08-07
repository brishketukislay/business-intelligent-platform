import { z } from "zod";


const envSchema = z.object({

  DATABASE_URL: z.string(),

  NEXT_PUBLIC_APP_NAME: z.string()
    .default("BI Finance Modelling Platform"),

  AUTH_SECRET: z.string()
});


export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,

  NEXT_PUBLIC_APP_NAME:
    process.env.NEXT_PUBLIC_APP_NAME,

  AUTH_SECRET:
    process.env.AUTH_SECRET
});
