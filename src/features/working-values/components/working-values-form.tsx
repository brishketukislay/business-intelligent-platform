"use client";

import {
useState,
} from "react";

import {
updateWorkingValueAction,
} from "../actions/working-value-actions";

import {
Input,
} from "@/components/ui/input";

import {
Button,
} from "@/components/ui/button";

import {
Label,
} from "@/components/ui/label";

type WorkingInput = {
id: string;
name: string;
key: string;
type: string;
unit: string | null;
category: string | null;
value: string | null;
};

export function WorkingValuesForm({
modelId,
inputs,
}: {
modelId: string;
inputs: WorkingInput[];
}) {

const [
values,
setValues,
] = useState<Record<string, string>>(
() => {

  const initialValues:
    Record<string, string> = {};

  for (const input of inputs) {

    initialValues[input.id] =
      input.value ?? "";

  }

  return initialValues;

}


);

const [
savingInputId,
setSavingInputId,
] = useState<string | null>(
null
);

const [
message,
setMessage,
] = useState<string | null>(
null
);

function handleChange(
inputId: string,
value: string
) {

setValues(
  current => ({
    ...current,
    [inputId]: value,
  })
);


}

async function handleSave(
inputId: string
) {

setSavingInputId(inputId);

setMessage(null);


const result =
  await updateWorkingValueAction(
    modelId,
    inputId,
    values[inputId] ?? ""
  );


if (result.success) {

  setMessage(
    "Working value saved."
  );

} else {

  setMessage(
    result.error ??
    "Unable to save working value."
  );

}


setSavingInputId(null);


}

if (inputs.length === 0) {

return (
  <div className="text-sm text-muted-foreground">
    Create input definitions before entering working values.
  </div>
);


}

return (

<div className="space-y-6">

  {inputs.map((input) => {

    const isNumeric =
      input.type === "Number" ||
      input.type === "Currency" ||
      input.type === "Percentage";


    return (

      <div
        key={input.id}
        className="space-y-2"
      >

        <Label
          htmlFor={`working-${input.id}`}
        >

          {input.name}

          {input.unit && (

            <span className="ml-2 text-muted-foreground">
              ({input.unit})
            </span>

          )}

        </Label>


        {input.category && (

          <p className="text-xs text-muted-foreground">
            {input.category}
          </p>

        )}


        <div className="flex gap-3">

          <Input
            id={`working-${input.id}`}
            type={
              isNumeric
                ? "number"
                : "text"
            }
            step={
              isNumeric
                ? "any"
                : undefined
            }
            value={
              values[input.id] ?? ""
            }
            onChange={(event) =>
              handleChange(
                input.id,
                event.target.value
              )
            }
          />


          <Button
            type="button"
            disabled={
              savingInputId === input.id
            }
            onClick={() =>
              handleSave(input.id)
            }
          >

            {savingInputId === input.id
              ? "Saving..."
              : "Save"}

          </Button>

        </div>


        {input.type === "Percentage" && (

          <p className="text-xs text-muted-foreground">
            Enter a value from 0 to 100.
          </p>

        )}

      </div>

    );

  })}


  {message && (

    <p className="text-sm text-muted-foreground">
      {message}
    </p>

  )}

</div>


);

}