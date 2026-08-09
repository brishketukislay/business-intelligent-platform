"use client";

import {
useState,
} from "react";

import {
saveModelValuesAction,
} from "../actions/saved-value-actions";

import {
Button,
} from "@/components/ui/button";

export function SaveModelValuesButton({
modelId,
}: {
modelId: string;
}) {

const [
isSaving,
setIsSaving,
] = useState(false);

const [
message,
setMessage,
] = useState<string | null>(
null
);

async function handleSave() {

setIsSaving(true);

setMessage(null);


try {

  const result =
    await saveModelValuesAction(
      modelId
    );


  if (result.success) {

    setMessage(
      `${result.count} working value${
        result.count === 1
          ? ""
          : "s"
      } saved.`
    );

  } else {

    setMessage(
      result.error ??
      "Unable to save model values."
    );

  }

} catch (error) {

  console.error(error);

  setMessage(
    "An unexpected error occurred."
  );

} finally {

  setIsSaving(false);

}


}

return (

<div className="flex items-center gap-3">

  <Button
    type="button"
    disabled={isSaving}
    onClick={handleSave}
  >

    {isSaving
      ? "Saving Model..."
      : "Save Model"}

  </Button>


  {message && (

    <span className="text-sm text-muted-foreground">
      {message}
    </span>

  )}

</div>


);

}