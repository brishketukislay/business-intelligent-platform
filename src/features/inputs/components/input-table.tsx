"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";

import {
  upsertPeriodValueAction,
} from "../actions/input-actions";


type InputDefinition = {
  id: string;
  name: string;
  key: string;
  type: string;
  unit: string | null;
  category: string | null;
  scope: string;
};


type ModelPeriod = {
  id: string;
  name: string;
  key: string;
  startDate?: string;
  endDate?: string;
  sortOrder: number;
  status?: string;
};


type PeriodValue = {
  id?: string;
  inputId: string;
  periodId: string;
  value: number | string | null;
};


type InputTableProps = {
  modelId: string;
  inputs: InputDefinition[];
  periods?: ModelPeriod[];
  periodValues?: PeriodValue[];
};


export function InputTable({
  modelId,
  inputs,
  periods = [],
  periodValues = [],
}: InputTableProps) {

  const [
    values,
    setValues,
  ] = useState<Record<string, string>>(
    () => {

      const initial:
        Record<string, string> = {};


      for (
        const periodValue
        of periodValues
      ) {

        const key =
          `${periodValue.inputId}:${periodValue.periodId}`;


        initial[key] =
          periodValue.value === null ||
          periodValue.value === undefined
            ? ""
            : String(periodValue.value);

      }


      return initial;

    }
  );


  const [
    savingKey,
    setSavingKey,
  ] = useState<string | null>(null);


  const [
    error,
    setError,
  ] = useState<string | null>(null);


  function getValue(
    inputId: string,
    periodId: string
  ): string {

    return (
      values[
        `${inputId}:${periodId}`
      ] ?? ""
    );

  }


  function setValue(
    inputId: string,
    periodId: string,
    value: string
  ) {

    const key =
      `${inputId}:${periodId}`;


    setValues(
      current => ({

        ...current,

        [key]:
          value,

      })
    );

  }


  function getInputType(
    input: InputDefinition
  ): "number" | "text" {

    switch (input.type) {

      case "Number":
      case "Currency":
      case "Percentage":

        return "number";

      default:

        return "text";

    }

  }


  function getStep(
    input: InputDefinition
  ): string | undefined {

    switch (input.type) {

      case "Number":
      case "Currency":
      case "Percentage":

        return "any";

      default:

        return undefined;

    }

  }


  async function saveValue(
    input: InputDefinition,
    period: ModelPeriod
  ) {

    const valueKey =
      `${input.id}:${period.id}`;


    setSavingKey(
      valueKey
    );

    setError(null);


    try {

      const rawValue =
        getValue(
          input.id,
          period.id
        );


      /*
       * Period values are stored as strings.
       *
       * This allows the input definition itself
       * to determine whether the field is numeric
       * or textual.
       */

      const result =
        await upsertPeriodValueAction(
          modelId,
          input.id,
          period.id,
          rawValue
        );


      if (!result.success) {

        setError(
          typeof result.error === "string"
            ? result.error
            : "Unable to save value."
        );

      }

    } catch (error) {

      console.error(error);

      setError(
        "Unable to save value."
      );

    } finally {

      setSavingKey(null);

    }

  }


  if (inputs.length === 0) {

    return (

      <div className="rounded-lg border border-dashed p-8 text-center">

        <p className="text-sm text-muted-foreground">
          No inputs have been configured for this model.
        </p>

      </div>

    );

  }


  if (periods.length === 0) {

    return (

      <div className="rounded-lg border border-dashed p-8 text-center">

        <p className="text-sm text-muted-foreground">
          No periods have been configured for this model.
        </p>

      </div>

    );

  }


  return (

    <div className="space-y-4">


      {error && (

        <div
          className="
            rounded-md
            border
            border-destructive/30
            bg-destructive/10
            px-4
            py-3
          "
        >

          <p className="text-sm text-destructive">
            {error}
          </p>

        </div>

      )}


      <div className="overflow-x-auto rounded-lg border">

        <table
          className="
            w-full
            min-w-[1100px]
            border-collapse
            text-sm
          "
        >

          <thead>

            <tr className="border-b bg-muted/40">

              <th
                className="
                  sticky
                  left-0
                  z-10
                  min-w-[220px]
                  border-r
                  bg-muted/40
                  px-4
                  py-3
                  text-left
                  font-medium
                "
              >
                Input
              </th>


              <th
                className="
                  min-w-[100px]
                  px-4
                  py-3
                  text-left
                  font-medium
                "
              >
                Type
              </th>


              <th
                className="
                  min-w-[100px]
                  px-4
                  py-3
                  text-left
                  font-medium
                "
              >
                Unit
              </th>


              <th
                className="
                  min-w-[120px]
                  px-4
                  py-3
                  text-left
                  font-medium
                "
              >
                Scope
              </th>


              {periods.map(
                period => (

                  <th
                    key={period.id}
                    className="
                      min-w-[120px]
                      px-3
                      py-3
                      text-center
                      font-medium
                    "
                  >
                    {period.name}
                  </th>

                )
              )}

            </tr>

          </thead>


          <tbody>

            {inputs.map(
              input => {

                const isPeriodInput =
                  input.scope === "PERIOD";


                return (

                  <tr
                    key={input.id}
                    className="border-b last:border-0"
                  >

                    {/* Input */}

                    <td
                      className="
                        sticky
                        left-0
                        z-10
                        border-r
                        bg-background
                        px-4
                        py-4
                      "
                    >

                      <div className="font-medium">
                        {input.name}
                      </div>


                      <div className="mt-1 text-xs text-muted-foreground">
                        {input.key}
                      </div>


                      {input.category && (

                        <div className="mt-1 text-xs text-muted-foreground">
                          {input.category}
                        </div>

                      )}

                    </td>


                    {/* Type */}

                    <td className="px-4 py-4 text-muted-foreground">
                      {input.type}
                    </td>


                    {/* Unit */}

                    <td className="px-4 py-4 text-muted-foreground">
                      {input.unit ?? "—"}
                    </td>


                    {/* Scope */}

                    <td className="px-4 py-4">

                      {isPeriodInput ? (

                        <span className="text-foreground">
                          Period
                        </span>

                      ) : (

                        <span className="text-muted-foreground">
                          Model
                        </span>

                      )}

                    </td>


                    {/* Period values */}

                    {periods.map(
                      period => {

                        const value =
                          getValue(
                            input.id,
                            period.id
                          );


                        const valueKey =
                          `${input.id}:${period.id}`;


                        /*
                         * Model-level inputs do not
                         * receive period editors.
                         *
                         * There is deliberately no
                         * key-based special case here.
                         */

                        if (!isPeriodInput) {

                          return (

                            <td
                              key={period.id}
                              className="
                                px-3
                                py-3
                                text-center
                                text-muted-foreground
                              "
                            >
                              —
                            </td>

                          );

                        }


                        return (

                          <td
                            key={period.id}
                            className="px-3 py-3"
                          >

                            <Input
                              type={getInputType(input)}
                              step={getStep(input)}
                              value={value}
                              placeholder="—"
                              onChange={
                                event =>
                                  setValue(
                                    input.id,
                                    period.id,
                                    event.target.value
                                  )
                              }
                              onBlur={() =>
                                saveValue(
                                  input,
                                  period
                                )
                              }
                              disabled={
                                savingKey === valueKey
                              }
                              className="h-9 min-w-[90px]"
                            />

                          </td>

                        );

                      }
                    )}

                  </tr>

                );

              }
            )}

          </tbody>

        </table>

      </div>


      <p className="text-xs text-muted-foreground">

        Inputs configured as{" "}
        <span className="font-medium text-foreground">
          Monthly / Period
        </span>{" "}
        can be entered separately for each model period.
        Model-level inputs do not have monthly values.

      </p>

    </div>

  );

}