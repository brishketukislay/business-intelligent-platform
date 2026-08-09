"use server";

import {
requireCurrentUser,
} from "@/lib/current-user";

import {
compareScenarios,
} from "../services/scenario-comparison-service";

export async function compareScenariosAction(
modelId: string
) {

const user =
await requireCurrentUser();

try {

const result =
  await compareScenarios(
    modelId,
    user.id
  );


return {

  success: true as const,

  data: result,

};


} catch (error) {

console.error(
  "Failed to compare scenarios:",
  error
);


return {

  success: false as const,

  error:
    error instanceof Error
      ? error.message
      : "Unable to compare scenarios.",

};


}

}