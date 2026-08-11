"use client";

import {
  useState,
} from "react";

import {
  Input,
} from "@/components/ui/input";

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

type CellErrors =
  Record<string, string>;

function validateCellValue(
  input: InputDefinition,
  value: string
): string | null {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return null;
  }

  if (
    input.type === "Number" ||
    input.type === "Currency" ||
    input.type === "Percentage"
  ) {
    if (
      !Number.isFinite(
        Number(trimmed)
      )
    ) {
      return "Must be a valid number.";
    }
  }

  if (
    input.type === "Text" &&
    trimmed.length > 1000
  ) {
    return "Maximum 1000 characters.";
  }

  return null;
}

export function InputTable({
  modelId,
  inputs,
  periods = [],
  periodValues = [],
}: InputTableProps) {
  const [
    values,
    setValues,
  ] = useState<
    Record<string, string>
  >(() => {
    const initial:
      Record<string, string> = {};

    for (
      const periodValue of
        periodValues
    ) {
      const key =
        `${periodValue.inputId}:${periodValue.periodId}`;

      initial[key] =
        periodValue.value ===
          null ||
        periodValue.value ===
          undefined
          ? ""
          : String(
              periodValue.value
            );
    }

    return initial;
  });

  const [
    savingKey,
    setSavingKey,
  ] = useState<string | null>(
    null
  );

  const [
    cellErrors,
    setCellErrors,
  ] = useState<CellErrors>({});

  function getValue(
    inputId: string,
    periodId: string
  ) {
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
      (current) => ({
        ...current,
        [key]: value,
      })
    );

    setCellErrors(
      (current) => {
        if (!current[key]) {
          return current;
        }

        const next = {
          ...current,
        };

        delete next[key];

        return next;
      }
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
  ) {
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

    const rawValue =
      getValue(
        input.id,
        period.id
      );

    const validationError =
      validateCellValue(
        input,
        rawValue
      );

    if (validationError) {
      setCellErrors(
        (current) => ({
          ...current,
          [valueKey]:
            validationError,
        })
      );

      return;
    }

    setSavingKey(
      valueKey
    );

    try {
      const result =
        await upsertPeriodValueAction(
          modelId,
          input.id,
          period.id,
          rawValue
        );

      if (!result.success) {
        setCellErrors(
          (current) => ({
            ...current,
            [valueKey]:
              typeof result.error ===
              "string"
                ? result.error
                : "Unable to save value.",
          })
        );

        return;
      }

      setCellErrors(
        (current) => {
          if (!current[valueKey]) {
            return current;
          }

          const next = {
            ...current,
          };

          delete next[valueKey];

          return next;
        }
      );
    } catch (error) {
      console.error(error);

      setCellErrors(
        (current) => ({
          ...current,
          [valueKey]:
            "Unable to save value. Please try again.",
        })
      );
    } finally {
      setSavingKey(null);
    }
  }

  if (inputs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No inputs have been configured for
          this model.
        </p>
      </div>
    );
  }

  if (periods.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No periods have been configured for
          this model.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[1100px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="sticky left-0 z-10 min-w-[220px] border-r bg-muted/40 px-4 py-3 text-left font-medium">
                Input
              </th>

              <th className="min-w-[100px] px-4 py-3 text-left font-medium">
                Type
              </th>

              <th className="min-w-[100px] px-4 py-3 text-left font-medium">
                Unit
              </th>

              <th className="min-w-[120px] px-4 py-3 text-left font-medium">
                Scope
              </th>

              {periods.map(
                (period) => (
                  <th
                    key={period.id}
                    className="min-w-[120px] px-3 py-3 text-center font-medium"
                  >
                    {period.name}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {inputs.map(
              (input) => {
                const isPeriodInput =
                  input.scope ===
                  "PERIOD";

                return (
                  <tr
                    key={input.id}
                    className="border-b last:border-0"
                  >
                    <td className="sticky left-0 z-10 border-r bg-background px-4 py-4">
                      <div className="font-medium">
                        {input.name}
                      </div>

                      <div className="mt-1 font-mono text-xs text-muted-foreground">
                        {input.key}
                      </div>

                      {input.category && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {input.category}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {input.type}
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {input.unit ?? "—"}
                    </td>

                    <td className="px-4 py-4">
                      {isPeriodInput
                        ? "Period"
                        : "Model"}
                    </td>

                    {periods.map(
                      (period) => {
                        if (
                          !isPeriodInput
                        ) {
                          return (
                            <td
                              key={period.id}
                              className="px-3 py-3 text-center text-muted-foreground"
                            >
                              —
                            </td>
                          );
                        }

                        const value =
                          getValue(
                            input.id,
                            period.id
                          );

                        const valueKey =
                          `${input.id}:${period.id}`;

                        const cellError =
                          cellErrors[
                            valueKey
                          ];

                        return (
                          <td
                            key={period.id}
                            className="px-3 py-3 align-top"
                          >
                            <Input
                              type={getInputType(
                                input
                              )}
                              step={getStep(
                                input
                              )}
                              value={value}
                              placeholder="—"
                              onChange={(
                                event
                              ) =>
                                setValue(
                                  input.id,
                                  period.id,
                                  event
                                    .target
                                    .value
                                )
                              }
                              onBlur={() =>
                                saveValue(
                                  input,
                                  period
                                )
                              }
                              disabled={
                                savingKey ===
                                valueKey
                              }
                              aria-invalid={
                                !!cellError
                              }
                              className={`h-9 min-w-[90px] ${
                                cellError
                                  ? "border-destructive"
                                  : ""
                              }`}
                            />

                            {cellError && (
                              <p className="mt-1 max-w-[150px] text-xs text-destructive">
                                {cellError}
                              </p>
                            )}
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
        Numeric inputs must contain valid
        numbers. Text inputs can contain up to
        1000 characters. Invalid values are
        highlighted without interrupting the
        rest of the model.
      </p>
    </div>
  );
}