import {
  Badge,
} from "@/components/ui/badge";

import type {
  CalculatedMetric,
} from "../services/metric-calculation-service";
import type {
  CalculatedScenarioMetric,
} from "@/features/scenarios/services/scenario-calculation-service";

function formatNumber(
  value: number
): string {

  return new Intl.NumberFormat(
    "en-GB",
    {
      maximumFractionDigits: 2,
    }
  ).format(value);

}


function formatValue(
  metric: CalculatedMetric | CalculatedScenarioMetric,
  value: number | null
): string {

  if (value === null) {
    return "—";
  }


  if (metric.type === "Percentage") {
    return `${formatNumber(value)}%`;
  }


  if (metric.type === "Currency") {

    const currencyMap:
      Record<string, string> = {

        GBP: "GBP",
        "£": "GBP",
        "Â£": "GBP",
        USD: "USD",
        "$": "USD",
        EUR: "EUR",
        "€": "EUR",

      };


    const currency =
      currencyMap[
        metric.unit ?? ""
      ] ?? "GBP";


    return new Intl.NumberFormat(
      "en-GB",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(value);

  }


  return formatNumber(value);

}


export function MetricResults({
  metrics,
}: {
  metrics: Array<
    CalculatedMetric | CalculatedScenarioMetric
  >;
}) {

  if (metrics.length === 0) {

    return (

      <div className="text-sm text-muted-foreground">
        No active metrics have been defined yet.
      </div>

    );

  }


  return (

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

      {metrics.map(
        metric => (

          <div
            key={metric.id}
            className="rounded-lg border bg-background p-5 shadow-sm"
          >

            <div className="flex items-start justify-between gap-4">

              <div>

                <h3 className="font-semibold">
                  {metric.name}
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  {metric.key}
                </p>

              </div>


              <Badge
                variant={
                  metric.error
                    ? "destructive"
                    : "secondary"
                }
              >
                {metric.error
                  ? "Error"
                  : metric.type}
              </Badge>

            </div>


            <div className="mt-6">

              <p className="text-3xl font-semibold tracking-tight">

                {formatValue(
                  metric,
                  metric.value
                )}

              </p>


              <p className="mt-1 text-xs text-muted-foreground">
                Latest period
              </p>


              {metric.unit && (

                <p className="mt-1 text-xs text-muted-foreground">
                  {metric.unit}
                </p>

              )}

            </div>


            {"periodValues" in metric &&
  metric.periodValues.length > 0 && (


              <div className="mt-5 overflow-x-auto border-t pt-4">

                <table className="w-full text-sm">

                  <thead>

                    <tr className="border-b">

                      <th className="py-2 text-left font-medium">
                        Period
                      </th>

                      <th className="py-2 text-right font-medium">
                        Value
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {metric.periodValues.map(
                      period => (

                        <tr
                          key={period.periodId}
                          className="border-b last:border-0"
                        >

                          <td className="py-2">
                            {period.periodName}
                          </td>

                          <td className="py-2 text-right">
                            {period.error
                              ? "Error"
                              : formatValue(
                                  metric,
                                  period.value
                                )}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}


            <div className="mt-5 border-t pt-4">

              <p className="text-xs text-muted-foreground">
                Formula
              </p>

              <code className="mt-1 block text-xs">
                {metric.formula}
              </code>

            </div>


            {metric.error && (

              <p className="mt-3 text-xs text-destructive">
                {metric.error}
              </p>

            )}

          </div>

        )
      )}

    </div>

  );

}
