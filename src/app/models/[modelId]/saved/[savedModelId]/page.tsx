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
getSavedModels,
} from "@/features/saved-values/services/saved-value-service";

import {
  calculateSavedModelMetrics,
} from "@/features/metrics/services/metric-calculation-service";

import {
  MetricResults,
} from "@/features/metrics/components/metric-results";


import {
Badge,
} from "@/components/ui/badge";

type SavedModelDetailPageProps = {
params: Promise<{
modelId: string;
savedModelId: string;
}>;
};

export default async function SavedModelDetailPage({
params,
}: SavedModelDetailPageProps) {

const {
modelId,
savedModelId,
} = await params;

if (!modelId || !savedModelId) {
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

if (model.createdBy !== user.id) {
notFound();
}

const savedModels =
await getSavedModels(
modelId,
user.id
);

const savedModel =
savedModels.find(
(item) =>
item.id === savedModelId
);

if (!savedModel) {
notFound();
}

const calculatedMetrics =
  await calculateSavedModelMetrics(
    savedModelId,
    user.id
  );


return (

<div className="space-y-8">

  <div className="space-y-4">

    <div className="flex flex-wrap items-center gap-3">

      <Link
        href={`/models/${model.id}/saved`}
        className="
          text-sm
          text-muted-foreground
          hover:text-foreground
        "
      >
        ← Back to Saved Models
      </Link>

      <span className="text-muted-foreground">
        /
      </span>

      <Link
        href={`/models/${model.id}`}
        className="
          text-sm
          text-muted-foreground
          hover:text-foreground
        "
      >
        {model.name}
      </Link>

    </div>


    <div className="flex items-start justify-between gap-6">

      <div>

        <h1 className="text-2xl font-semibold tracking-tight">
          {savedModel.name}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Saved snapshot created{" "}
          {savedModel.createdAt.toLocaleString()}
        </p>

      </div>


      <Badge variant="secondary">

        {savedModel.values.length}

        {" "}

        {savedModel.values.length === 1
          ? "value"
          : "values"}

      </Badge>

    </div>

  </div>


  <div className="rounded-lg border bg-background">

    <div className="border-b px-6 py-4">

      <h2 className="font-semibold">
        Saved Values
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Read-only values captured in this snapshot.
      </p>

    </div>


    {savedModel.values.length === 0 ? (

      <div className="p-6 text-sm text-muted-foreground">
        This saved model contains no values.
      </div>

    ) : (

      <div className="divide-y">

        {savedModel.values.map(
          (savedValue) => (

            <div
              key={savedValue.id}
              className="grid gap-4 px-6 py-5 md:grid-cols-[1fr_1fr_auto]"
            >

              <div>

                <p className="font-medium">
                  {savedValue.input.name}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {savedValue.input.key}
                </p>

              </div>


              <div>

                <p className="text-xs text-muted-foreground">
                  Value
                </p>

                <p className="mt-1 font-medium">
                  {savedValue.value}

                  {savedValue.input.unit
                    ? ` ${savedValue.input.unit}`
                    : ""}

                </p>

              </div>


              <div className="flex items-start md:justify-end">

                <Badge variant="outline">
                  {savedValue.input.type}
                </Badge>

              </div>

            </div>

          )
        )}

      </div>

    )}

  </div>
<div className="rounded-lg border bg-background">

  <div className="border-b px-6 py-4">

    <h2 className="font-semibold">
      Calculated Metrics
    </h2>

    <p className="mt-1 text-sm text-muted-foreground">
      Metrics calculated using the values stored in this snapshot.
    </p>

  </div>

  <div className="p-6">

    <MetricResults
      metrics={calculatedMetrics}
    />

  </div>

</div>


  <div className="flex flex-wrap gap-3">

    <Link
      href={`/models/${model.id}/inputs`}
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
        shadow-sm
        hover:bg-accent
        hover:text-accent-foreground
      "
    >
      Back to Inputs
    </Link>


    <Link
      href={`/models/${model.id}/metrics`}
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
      "
    >
      View Metrics
    </Link>

  </div>

</div>


);

}