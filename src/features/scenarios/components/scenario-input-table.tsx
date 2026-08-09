"use client";

import {
  useState,
} from "react";

import {
  updateScenarioValueAction,
} from "../actions/scenario-value-actions";

import {
  Button,
} from "@/components/ui/button";


type ScenarioInput = {

  id: string;

  name: string;

  key: string;

  type: string;

  unit: string | null;

};


type ScenarioValue = {

  inputId: string;

  value: string;

};


export function ScenarioInputTable({
  modelId,
  scenarioId,
  inputs,
  values,
}: {
  modelId: string;
  scenarioId: string;
  inputs: ScenarioInput[];
  values: ScenarioValue[];
}) {

  const valueMap =
    new Map(
      values.map(
        (item) => [
          item.inputId,
          item.value,
        ]
      )
    );


  if (inputs.length === 0) {

    return (

      <div className="text-sm text-muted-foreground">

        No active inputs have been defined for this model.

      </div>

    );

  }


  return (

    <div className="space-y-4">

      {inputs.map(
        (input) => (

          <ScenarioInputRow
            key={input.id}
            modelId={modelId}
            scenarioId={scenarioId}
            input={input}
            initialValue={
              valueMap.get(input.id) ?? ""
            }
          />

        )
      )}

    </div>

  );

}


function ScenarioInputRow({
  modelId,
  scenarioId,
  input,
  initialValue,
}: {
  modelId: string;
  scenarioId: string;
  input: ScenarioInput;
  initialValue: string;
}) {

  const [
    value,
    setValue,
  ] = useState(initialValue);


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
        await updateScenarioValueAction(
          modelId,
          scenarioId,
          input.id,
          value
        );


      if (result.success) {

        setMessage("Saved.");

      } else {

        setMessage(
          result.error ??
          "Unable to save value."
        );

      }

    } catch (error) {

      console.error(error);

      setMessage(
        "Unable to save value."
      );

    } finally {

      setIsSaving(false);

    }

  }


  return (

    <div className="grid gap-4 rounded-lg border bg-background p-5 md:grid-cols-[1fr_1fr_auto]">

      <div>

        <p className="font-medium">
          {input.name}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {input.key}
        </p>

        <div className="mt-2 flex gap-2">

          <span className="text-xs text-muted-foreground">
            {input.type}
          </span>

          {input.unit && (

            <span className="text-xs text-muted-foreground">
              · {input.unit}
            </span>

          )}

        </div>

      </div>


      <div className="flex items-center">

        <input
          value={value}
          onChange={(event) =>
            setValue(event.target.value)
          }
          placeholder="Enter value"
          className="
            h-9
            w-full
            rounded-md
            border
            border-input
            bg-background
            px-3
            text-sm
            shadow-sm
            outline-none
            focus:ring-2
            focus:ring-ring
          "
          disabled={isSaving}
        />

      </div>


      <div className="flex items-center gap-3">

        <Button
          type="button"
          onClick={handleSave}
          disabled={
            isSaving ||
            !value.trim()
          }
        >

          {isSaving
            ? "Saving..."
            : "Save"}

        </Button>


        {message && (

          <span className="text-xs text-muted-foreground">
            {message}
          </span>

        )}

      </div>

    </div>

  );

}
