"use client";

import {
  useState,
} from "react";

import {
  Button,
} from "@/components/ui/button";

import {
  MetricForm,
} from "./metric-form";

import {
  MetricTable,
} from "./metric-table";


type MetricDefinition = {
  id: string;
  modelId: string;
  name: string;
  key: string;
  type: string;
  unit: string | null;
  category: string | null;
  formula: string;
  status: string;
};


type MetricsWorkspaceProps = {
  modelId: string;
  metrics: MetricDefinition[];
};


export function MetricsWorkspace({
  modelId,
  metrics,
}: MetricsWorkspaceProps) {

  const [
    showAddMetric,
    setShowAddMetric,
  ] = useState(false);


  const [
    showDefinitions,
    setShowDefinitions,
  ] = useState(false);


  return (

    <div className="space-y-6">

      {/* Add Metric */}

      <div className="rounded-lg border bg-background">

        <div className="
          flex
          flex-col
          gap-4
          p-4
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:p-6
        ">

          <div className="min-w-0">

            <h2 className="font-semibold">
              Add Metric
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Define a calculated metric using your model inputs.
            </p>

          </div>


          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() =>
              setShowAddMetric(
                current => !current
              )
            }
          >
            {showAddMetric
              ? "Close"
              : "Add Metric"}
          </Button>

        </div>


        {showAddMetric && (

          <div className="border-t p-4 sm:p-6">

            <MetricForm
              modelId={modelId}
            />

          </div>

        )}

      </div>


      {/* Metric Definitions */}

      <div className="rounded-lg border bg-background">

        <div className="
          flex
          flex-col
          gap-4
          p-4
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:p-6
        ">

          <div className="min-w-0">

            <h2 className="font-semibold">
              Metric Definitions
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {metrics.length === 0
                ? "No metric definitions have been created yet."
                : `${metrics.length} metric definition${metrics.length === 1 ? "" : "s"} configured.`}
            </p>

          </div>


          {metrics.length > 0 && (

            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() =>
                setShowDefinitions(
                  current => !current
                )
              }
            >
              {showDefinitions
                ? "Hide Definitions"
                : "View Definitions"}
            </Button>

          )}

        </div>


        {showDefinitions && metrics.length > 0 && (

          <div className="border-t p-4 sm:p-6">

            <div className="w-full min-w-0 overflow-x-auto">

              <div className="min-w-[640px]">

<MetricTable
  metrics={metrics}
/>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}