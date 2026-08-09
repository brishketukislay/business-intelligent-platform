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

  modelId: string;

  name: string;

  key: string;

  type: string;

  unit: string | null;

  category: string | null;

  value: string;

};


export function ScenarioInputs({
  modelId,
  scenarioId,
  inputs,
}: {
  modelId: string;
  scenarioId: string;
  inputs: ScenarioInput[];
}) {

  if (inputs.length === 0) {

    return (

      <div className="text-sm text-muted-foreground">
        No active inputs have been defined for this model.
      </div>

    );

  }


  return (

    <div className="divide-y">

      {inputs.map(
        (input) => (

          <ScenarioInputRow
            key={input.id}
            modelId={modelId}
            scenarioId={scenarioId}
            input={input}
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
}: {
  modelId: string;
  scenarioId: string;
  input: ScenarioInput;
}) {

  const [
    value,
    setValue,
  ] = useState(input.value);


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
        "An unexpected error occurred."
      );

    } finally {

      setIsSaving(false);

    }

  }


  return (

    <div className="grid gap-4 px-6 py-5 md:grid-cols-[1fr_1fr_auto] md:items-center">

      <div>

        <p className="font-medium">
          {input.name}
        </p>


        <p className="mt-1 text-xs text-muted-foreground">
          {input.key}
        </p>


        {input.category && (

          <p className="mt-1 text-xs text-muted-foreground">
            {input.category}
          </p>

        )}

      </div>


      <div>

        <div className="flex items-center gap-2">

          <input
            type={
              input.type === "Number" ||
              input.type === "Currency" ||
              input.type === "Percentage"
                ? "number"
                : "text"
            }
            step={
              input.type === "Percentage"
                ? "0.01"
                : "any"
            }
            value={value}
            onChange={(event) =>
              setValue(event.target.value)
            }
            placeholder="Enter value"
            disabled={isSaving}
            className="
              flex
              h-9
              w-full
              rounded-md
              border
              border-input
              bg-background
              px-3
              py-1
              text-sm
              shadow-sm
              outline-none
              focus:ring-2
              focus:ring-ring
            "
          />


          {input.unit && (

            <span className="min-w-fit text-sm text-muted-foreground">
              {input.unit}
            </span>

          )}

        </div>

      </div>


      <div className="flex items-center gap-3 md:justify-end">

        <Button
          type="button"
          size="sm"
          disabled={
            isSaving ||
            !value.trim()
          }
          onClick={handleSave}
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
