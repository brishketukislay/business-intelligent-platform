"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  generateModelPeriodsAction,
} from "../actions/model-period-actions";


type ModelPeriod = {
  id: string;
  name: string;
  key: string;
  startDate: string;
  endDate: string;
  sortOrder: number;
  status: string;
};


type ModelPeriodSettingsProps = {
  modelId: string;
  periods: ModelPeriod[];
};


const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


export function ModelPeriodSettings({
  modelId,
  periods,
}: ModelPeriodSettingsProps) {

  const [
    startMonth,
    setStartMonth,
  ] = useState(1);


  const [
    isGenerating,
    setIsGenerating,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<string | null>(null);


  async function handleGenerate() {

    setIsGenerating(true);
    setError(null);


    try {

      const result =
        await generateModelPeriodsAction(
          modelId,
          startMonth
        );


      if (!result.success) {

        setError(
          typeof result.error === "string"
            ? result.error
            : "Unable to generate periods."
        );

        return;

      }


      window.location.reload();

    } catch (error) {

      console.error(error);

      setError(
        "Unable to generate periods."
      );

    } finally {

      setIsGenerating(false);

    }

  }


  function formatDate(
    value: string
  ) {

    return new Date(
      value
    ).toLocaleDateString(
      "en-GB",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

  }


  return (

    <div className="space-y-6">

      <div>

        <h2 className="text-base font-semibold">
          Period settings
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Define the monthly periods used by this model.
        </p>

      </div>


      <div className="grid gap-4 sm:grid-cols-2">

        <div className="space-y-2">

          <Label htmlFor="period-type">
            Period type
          </Label>

          <select
            id="period-type"
            value="MONTH"
            disabled
            className="
              h-10
              w-full
              rounded-md
              border
              border-input
              bg-muted
              px-3
              text-sm
              text-muted-foreground
            "
          >

            <option value="MONTH">
              Monthly
            </option>

          </select>

        </div>


        <div className="space-y-2">

          <Label htmlFor="period-start">
            Fiscal year starts
          </Label>

          <select
            id="period-start"
            value={startMonth}
            onChange={(event) =>
              setStartMonth(
                Number(
                  event.target.value
                )
              )
            }
            disabled={
              periods.length > 0 ||
              isGenerating
            }
            className="
              h-10
              w-full
              rounded-md
              border
              border-input
              bg-background
              px-3
              text-sm
            "
          >

            {MONTHS.map(
              (month, index) => (

                <option
                  key={month}
                  value={index + 1}
                >
                  {month}
                </option>

              )
            )}

          </select>

        </div>

      </div>


      {error && (

        <div
          className="
            rounded-md
            border
            border-red-200
            bg-red-50
            px-4
            py-3
          "
        >

          <p className="text-sm text-red-700">
            {error}
          </p>

        </div>

      )}


      <Button
        type="button"
        onClick={handleGenerate}
        disabled={
          isGenerating ||
          periods.length > 0
        }
      >
        {isGenerating
          ? "Generating..."
          : periods.length > 0
            ? "Periods generated"
            : "Generate periods"}
      </Button>


      {periods.length > 0 && (

        <div className="rounded-lg border bg-background">

          <div className="border-b px-4 py-3">

            <h3 className="text-sm font-semibold">
              Periods
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              These periods will be used for monthly inputs
              and calculations.
            </p>

          </div>


          <div className="divide-y">

            {periods
              .sort(
                (a, b) =>
                  a.sortOrder -
                  b.sortOrder
              )
              .map(
                (period) => (

                  <div
                    key={period.id}
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      px-4
                      py-3
                    "
                  >

                    <span className="text-sm font-medium">
                      {period.name}
                    </span>


                    <span className="text-xs text-muted-foreground">
                      {formatDate(
                        period.startDate
                      )}
                      {" – "}
                      {formatDate(
                        period.endDate
                      )}
                    </span>

                  </div>

                )
              )}

          </div>

        </div>

      )}

    </div>

  );
}
