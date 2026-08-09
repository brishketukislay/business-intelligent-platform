"use server";

import {
revalidatePath,
} from "next/cache";

import {
requireCurrentUser,
} from "@/lib/current-user";

import {
metricDefinitionSchema,
type MetricDefinitionInput,
} from "../schemas/metric-schema";

import {
createMetricDefinition,
updateMetricDefinition,
deactivateMetricDefinition,
} from "../services/metric-service";

function formDataToMetricDefinition(
formData: FormData
): MetricDefinitionInput {

return {

modelId:
  String(
    formData.get("modelId") ?? ""
  ),

name:
  String(
    formData.get("name") ?? ""
  ).trim(),

key:
  String(
    formData.get("key") ?? ""
  ).trim(),

type:
  String(
    formData.get("type") ?? "Number"
  ) as MetricDefinitionInput["type"],

unit:
  String(
    formData.get("unit") ?? ""
  ).trim() || undefined,

category:
  String(
    formData.get("category") ?? ""
  ).trim() || undefined,

formula:
  String(
    formData.get("formula") ?? ""
  ).trim(),


};

}

export async function createMetricAction(
formData: FormData
) {

const user =
await requireCurrentUser();

const result =
metricDefinitionSchema.safeParse(
formDataToMetricDefinition(
formData
)
);

if (!result.success) {

return {

  success: false,

  error:
    result.error.flatten(),

};


}

try {

await createMetricDefinition(
  result.data,
  user.id
);


revalidatePath(
  `/models/${result.data.modelId}/metrics`
);


return {
  success: true,
};


} catch (error) {

console.error(
  "Failed to create metric definition:",
  error
);


return {

  success: false,

  error:
    "Unable to create metric definition.",

};


}

}

export async function updateMetricAction(
id: string,
formData: FormData
) {

const user =
await requireCurrentUser();

const result =
metricDefinitionSchema.safeParse(
formDataToMetricDefinition(
formData
)
);

if (!result.success) {

return {

  success: false,

  error:
    result.error.flatten(),

};


}

try {

await updateMetricDefinition(
  id,
  result.data,
  user.id
);


revalidatePath(
  `/models/${result.data.modelId}/metrics`
);


return {
  success: true,
};


} catch (error) {

console.error(
  "Failed to update metric definition:",
  error
);


return {

  success: false,

  error:
    "Unable to update metric definition.",

};


}

}

export async function deactivateMetricAction(
id: string,
modelId: string
) {

const user =
await requireCurrentUser();

try {

await deactivateMetricDefinition(
  id,
  user.id
);


revalidatePath(
  `/models/${modelId}/metrics`
);


return {
  success: true,
};


} catch (error) {

console.error(
  "Failed to deactivate metric definition:",
  error
);


return {

  success: false,

  error:
    "Unable to deactivate metric definition.",

};


}

}