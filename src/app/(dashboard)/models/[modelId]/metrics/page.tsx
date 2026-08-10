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
calculateMetrics,
} from "@/features/metrics/services/metric-calculation-service";

import {
MetricResults,
} from "@/features/metrics/components/metric-results";

import {
MetricsWorkspace,
} from "@/features/metrics/components/metrics-workspace";

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

<div className="w-full min-w-0 space-y-8">

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


    <div className="min-w-0">

      <h1 className="text-2xl font-semibold tracking-tight">
        Metrics
      </h1>

      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Configure and calculate metrics for{" "}

        <span className="font-medium text-foreground">
          {model.name}
        </span>
      </p>

    </div>

  </div>


  {/* Calculated Results */}

  <section className="min-w-0 space-y-4">

    <div>

      <h2 className="text-lg font-semibold">
        Calculated Results
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Current metric values calculated from the model's
        working inputs.
      </p>

    </div>


    <div className="min-w-0 overflow-x-auto">

      <MetricResults
        metrics={calculatedMetrics}
      />

    </div>

  </section>


  {/* Metric Management */}

  <MetricsWorkspace
    modelId={model.id}
    metrics={metrics}
  />

</div>


);

}