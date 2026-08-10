"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  saveScenarioValue,
} from "../actions/scenario-actions";


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


type ScenarioInputsProps = {
  modelId: string;
  scenarioId: string;
  inputs: ScenarioInput[];
  readOnly?: boolean;
};


export function ScenarioInputs({
  modelId,
  scenarioId,
  inputs,
  readOnly = false,
}: ScenarioInputsProps) {

  const [
    isPending,
    startTransition,
  ] = useTransition();


  /*
   * Keep the user's typing in local state.
   *
   * This prevents the server action from replacing
   * the input after every keystroke.
   */
  const [
    values,
    setValues,
  ] = useState<Record<string, string>>(
    () => {

      const initial:
        Record<string, string> = {};

      for (
        const input
        of inputs
      ) {

        initial[input.id] =
          input.value;

      }

      return initial;

    }
  );


  function handleChange(
    inputId: string,
    value: string
  ) {

    setValues(
      (current) => ({

        ...current,

        [inputId]:
          value,

      })
    );

  }


  function handleBlur(
    inputId: string
  ) {

    if (readOnly) {
      return;
    }


    const value =
      values[inputId] ?? "";


    startTransition(async () => {

      await saveScenarioValue({

        modelId,

        scenarioId,

        inputId,

        value,

      });

    });

  }


  if (inputs.length === 0) {

    return (

      <div className="p-6">

        <p className="text-sm text-muted-foreground">
          No active inputs are available for this scenario.
        </p>

      </div>

    );

  }


  return (

    <div className="divide-y">

      {inputs.map(
        (input) => (

          <div
            key={input.id}
            className="grid gap-4 p-6 sm:grid-cols-[1fr_280px]"
          >

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


            <div className="flex items-center gap-2">

              <input
                type={
                  input.type === "NUMBER"
                    ? "number"
                    : "text"
                }

                value={
                  values[input.id] ?? ""
                }

                disabled={
                  readOnly
                }

                onChange={(event) => {

                  handleChange(
                    input.id,
                    event.target.value
                  );

                }}

                onBlur={() => {

                  handleBlur(
                    input.id
                  );

                }}

                className="
                  flex
                  h-10
                  w-full
                  rounded-md
                  border
                  border-input
                  bg-background
                  px-3
                  py-2
                  text-sm
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />


              {input.unit && (

                <span className="text-sm text-muted-foreground">
                  {input.unit}
                </span>

              )}

            </div>

          </div>

        )
      )}

    </div>

  );

}
