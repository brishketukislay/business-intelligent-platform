"use client";

import {
  Badge,
} from "@/components/ui/badge";


type ComparisonMetric = {

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

};


export function ScenarioComparisonTable({
  scenarios,
  metrics,
}: {
  scenarios: {
    id: string;
    name: string;
  }[];

  metrics: ComparisonMetric[];
}) {

  if (scenarios.length === 0) {

    return (

      <div className="rounded-lg border bg-background p-8">

        <p className="text-sm text-muted-foreground">
          No active scenarios are available for comparison.
        </p>

      </div>

    );

  }


  if (metrics.length === 0) {

    return (

      <div className="rounded-lg border bg-background p-8">

        <p className="text-sm text-muted-foreground">
          No active metrics are available for comparison.
        </p>

      </div>

    );

  }


  function formatValue(
    metric: ComparisonMetric,
    value: number | null
  ) {

    if (value === null) {
      return "—";
    }


    if (metric.type === "Percentage") {

      return `${value}%`;

    }


    if (metric.type === "Currency") {

      return new Intl.NumberFormat(
        "en-GB",
        {
          style: "currency",
          currency:
            metric.unit || "GBP",
          maximumFractionDigits: 2,
        }
      ).format(value);

    }


    return new Intl.NumberFormat(
      "en-GB",
      {
        maximumFractionDigits: 2,
      }
    ).format(value);

  }


  return (

    <div className="overflow-x-auto rounded-lg border">

      <table className="w-full min-w-[700px] text-sm">

        <thead>

          <tr className="border-b bg-muted/40">

            <th className="px-4 py-4 text-left font-semibold">
              Metric
            </th>


            {scenarios.map(
              (scenario) => (

                <th
                  key={scenario.id}
                  className="px-4 py-4 text-left font-semibold"
                >
                  {scenario.name}
                </th>

              )
            )}

          </tr>

        </thead>


        <tbody>

          {metrics.map(
            (metric) => (

              <tr
                key={metric.id}
                className="border-b last:border-0"
              >

                <td className="px-4 py-4">

                  <div className="flex items-center gap-2">

                    <span className="font-medium">
                      {metric.name}
                    </span>

                    <Badge variant="secondary">
                      {metric.type}
                    </Badge>

                  </div>


                  <p className="mt-1 text-xs text-muted-foreground">
                    {metric.key}
                  </p>

                </td>


                {scenarios.map(
                  (scenario) => {

                    const result =
                      metric.values.find(
                        (value) =>
                          value.scenarioId ===
                          scenario.id
                      );


                    return (

                      <td
                        key={scenario.id}
                        className="px-4 py-4"
                      >

                        {result?.error ? (

                          <span className="text-xs text-destructive">
                            Error
                          </span>

                        ) : (

                          <span className="font-semibold">
                            {formatValue(
                              metric,
                              result?.value ?? null
                            )}
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

  );

}