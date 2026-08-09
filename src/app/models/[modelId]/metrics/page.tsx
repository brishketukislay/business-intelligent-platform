import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  getBusinessModelById,
} from "@/features/models/services/model-service";

import {
  getMetricDefinitions,
} from "@/features/metrics/services/metric-service";

import {
  MetricForm,
} from "@/features/metrics/components/metric-form";

import {
  MetricTable,
} from "@/features/metrics/components/metric-table";

import {
  calculateMetrics,
} from "@/features/metrics/services/metric-calculation-service";

import {
  MetricResults,
} from "@/features/metrics/components/metric-results";


type ModelMetricsPageProps = {
  params: Promise<{
    modelId: string;
  }>;
};


export default async function ModelMetricsPage({
  params,
}: ModelMetricsPageProps) {

  const {
    modelId,
  } = await params;


  if (!modelId) {
    notFound();
  }


  const user =
    await requireCurrentUser();


  const model =
    await getBusinessModelById(
      modelId,
      user.id
    );


  if (!model) {
    notFound();
  }


  const metrics =
    await getMetricDefinitions(
      modelId,
      user.id
    );


  const calculatedMetrics =
    await calculateMetrics(
      modelId,
      user.id
    );


  return (

    <div className="space-y-8">

      {/* Header */}

      <div className="space-y-3">

        <Link
          href={`/models/${model.id}`}
          className="
            text-sm
            text-muted-foreground
            hover:text-foreground
          "
        >
          ← Back to {model.name}
        </Link>


        <div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Metrics
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">

            Configure and calculate metrics for{" "}

            <span className="font-medium text-foreground">
              {model.name}
            </span>

          </p>

        </div>

      </div>


      {/* Calculated Results */}

      <div className="space-y-4">

        <div>

          <h2 className="text-lg font-semibold">
            Calculated Results
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Current metric values calculated from the model's
            working inputs.
          </p>

        </div>


        <MetricResults
          metrics={calculatedMetrics}
        />

      </div>


      {/* Add Metric */}

      <div className="rounded-lg border bg-background p-6">

        <div className="mb-6">

          <h2 className="font-semibold">
            Add Metric Definition
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Define a calculated metric using your model inputs.
          </p>

        </div>


        <MetricForm
          modelId={model.id}
        />

      </div>


      {/* Metric Definitions */}

      <div className="rounded-lg border bg-background">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold">
            Metric Definitions
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Metrics configured for this business model.
          </p>

        </div>


        <div className="p-6">

          <MetricTable
            metrics={metrics}
          />

        </div>

      </div>

    </div>

  );

}
