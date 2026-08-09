"use client";

import {
  useState,
} from "react";

import {
  compareScenariosAction,
} from "../actions/scenario-comparison-actions";


type ComparisonResult = {

  scenarios: {
    id: string;
    name: string;
  }[];

  metrics: {
    id: string;
    name: string;
    key: string;
    type: string;
    unit: string | null;
    formula: string;

    values: {
      scenarioId: string;
      scenarioName: string;
      value: number | null;
      error: string | null;
    }[];

  }[];

};


export function ScenarioComparison({
  modelId,
}: {
  modelId: string;
}) {

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);


  const [
    result,
    setResult,
  ] = useState<ComparisonResult | null>(
    null
  );


  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  async function handleCompare() {

    setIsLoading(true);

    setError(null);


    try {

      const response =
        await compareScenariosAction(
          modelId
        );


      if (!response.success) {

        setError(
          response.error ??
          "Unable to compare scenarios."
        );

        return;

      }


      setResult(
        response.data
      );

    } catch (error) {

      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to compare scenarios."
      );

    } finally {

      setIsLoading(false);

    }

  }


  if (!result) {

    return (

      <div className="rounded-lg border bg-background p-6">

        <div className="flex items-center justify-between gap-4">

          <div>

            <h2 className="font-semibold">
              Scenario Comparison
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Compare calculated metrics across active scenarios.
            </p>

          </div>


          <button
            type="button"
            onClick={handleCompare}
            disabled={isLoading}
            className="
              inline-flex
              h-9
              items-center
              justify-center
              rounded-md
              bg-primary
              px-4
              py-2
              text-sm
              font-medium
              text-primary-foreground
              hover:bg-primary/90
              disabled:pointer-events-none
              disabled:opacity-50
            "
          >
            {isLoading
              ? "Comparing..."
              : "Compare Scenarios"}
          </button>

        </div>


        {error && (

          <p className="mt-4 text-sm text-destructive">
            {error}
          </p>

        )}

      </div>

    );

  }


  if (result.scenarios.length === 0) {

    return (

      <div className="rounded-lg border bg-background p-6">

        <div className="flex items-center justify-between gap-4">

          <div>

            <h2 className="font-semibold">
              Scenario Comparison
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Compare calculated metrics across active scenarios.
            </p>

          </div>

          <button
            type="button"
            onClick={handleCompare}
            disabled={isLoading}
            className="
              inline-flex
              h-9
              items-center
              justify-center
              rounded-md
              border
              border-input
              bg-background
              px-4
              py-2
              text-sm
              font-medium
              hover:bg-accent
              hover:text-accent-foreground
              disabled:pointer-events-none
              disabled:opacity-50
            "
          >
            {isLoading
              ? "Comparing..."
              : "Refresh"}
          </button>

        </div>


        <p className="mt-4 text-sm text-muted-foreground">
          No active scenarios are available to compare.
        </p>

      </div>

    );

  }


  return (

    <div className="rounded-lg border bg-background">

      <div className="flex items-center justify-between gap-4 border-b px-6 py-4">

        <div>

          <h2 className="font-semibold">
            Scenario Comparison
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Compare calculated metrics across your active scenarios.
          </p>

        </div>


        <button
          type="button"
          onClick={handleCompare}
          disabled={isLoading}
          className="
            inline-flex
            h-9
            items-center
            justify-center
            rounded-md
            border
            border-input
            bg-background
            px-4
            py-2
            text-sm
            font-medium
            hover:bg-accent
            hover:text-accent-foreground
            disabled:pointer-events-none
            disabled:opacity-50
          "
        >
          {isLoading
            ? "Comparing..."
            : "Refresh"}
        </button>

      </div>


      {error && (

        <div className="border-b px-6 py-4">

          <p className="text-sm text-destructive">
            {error}
          </p>

        </div>

      )}


      {result.metrics.length === 0 ? (

        <div className="p-6 text-sm text-muted-foreground">
          No calculated metrics are available for comparison.
        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>

              <tr className="border-b bg-muted/30">

                <th className="px-6 py-4 text-left font-medium">
                  Metric
                </th>


                {result.scenarios.map(
                  (scenario) => (

                    <th
                      key={scenario.id}
                      className="px-6 py-4 text-right font-medium"
                    >
                      {scenario.name}
                    </th>

                  )
                )}

              </tr>

            </thead>


            <tbody>

              {result.metrics.map(
                (metric) => (

                  <tr
                    key={metric.id}
                    className="border-b last:border-0"
                  >

                    <td className="px-6 py-4">

                      <p className="font-medium">
                        {metric.name}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {metric.key}
                      </p>

                    </td>


                    {result.scenarios.map(
                      (scenario) => {

                        const value =
                          metric.values.find(
                            (item) =>
                              item.scenarioId ===
                              scenario.id
                          );


                        return (

                          <td
                            key={scenario.id}
                            className="px-6 py-4 text-right"
                          >

                            {value?.error ? (

                              <span className="text-destructive">
                                Error
                              </span>

                            ) : value?.value === null ||
                              value?.value === undefined ? (

                              <span className="text-muted-foreground">
                                —
                              </span>

                            ) : (

                              <span className="font-medium">
                                {value.value}

                                {metric.unit
                                  ? ` ${metric.unit}`
                                  : ""}
                              </span>

                            )}

                          </td>

                        );

                      }
                    )}

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}
