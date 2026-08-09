"use server";

import {
revalidatePath,
} from "next/cache";

import {
requireCurrentUser,
} from "@/lib/current-user";

import {
saveWorkingValues,
} from "../services/saved-value-service";

export async function saveModelValuesAction(
modelId: string
) {

const user =
await requireCurrentUser();

try {

const savedModel =
  await saveWorkingValues(
    modelId,
    user.id
  );


revalidatePath(
  `/models/${modelId}`
);

revalidatePath(
  `/models/${modelId}/inputs`
);


return {

  success: true,

  count:
    savedModel.values.length,

};


} catch (error) {

console.error(
  "Failed to save model values:",
  error
);


return {

  success: false,

  error:
    error instanceof Error
      ? error.message
      : "Unable to save model values.",

};


}

}