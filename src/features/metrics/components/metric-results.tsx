import {
  Badge,
} from "@/components/ui/badge";

import type {
  CalculatedMetric,
} from "../services/metric-calculation-service";


function formatValue(
  metric: CalculatedMetric
): string {

  if (metric.value === null) {
    return "—";
  }

  if (metric.type === "Percentage") {
    return `${metric.value}%`;
  }

  if (metric.type === "Currency") {

    const currencyMap: Record<string, string> = {
      GBP: "GBP",
      "£": "GBP",
      "Â£": "GBP",
      USD: "USD",
      "$": "USD",
      EUR: "EUR",
      "€": "EUR",
    };

    const currency =
      currencyMap[metric.unit ?? ""] ?? "GBP";

    return new Intl.NumberFormat(
      "en-GB",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(metric.value);

  }

  return new Intl.NumberFormat(
    "en-GB",
    {
      maximumFractionDigits: 2,
    }
  ).format(metric.value);

}



export function MetricResults({
  metrics,
}: {
  metrics: CalculatedMetric[];
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
        (metric) => (

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

                {formatValue(metric)}

              </p>


              {metric.unit && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {metric.unit}
                </p>
              )}

            </div>


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
