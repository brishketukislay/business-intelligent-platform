import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  getBusinessModelById,
} from "@/features/models/services/model-service";

import {
  Badge,
} from "@/components/ui/badge";


type ModelPageProps = {
  params: Promise<{
    modelId: string;
  }>;
};


export default async function ModelDetailPage({
  params,
}: ModelPageProps) {

  const {
    modelId,
  } = await params;


  if (!modelId) {
    notFound();
  }


  const model =
    await getBusinessModelById(
      modelId
    );


  if (!model) {
    notFound();
  }


  return (

    <div className="space-y-8">

      <div className="flex items-start justify-between gap-6">

        <div className="space-y-2">

          <div className="flex items-center gap-3">

            <h1 className="text-2xl font-semibold tracking-tight">
              {model.name}
            </h1>


            <Badge
              variant={
                model.status === "ACTIVE"
                  ? "default"
                  : "secondary"
              }
            >
              {model.status}
            </Badge>

          </div>


          <p className="max-w-2xl text-sm text-muted-foreground">
            {model.description ??
              "No description provided."}
          </p>

        </div>


        <Link
          href={`/models/${model.id}/edit`}
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Edit Model
        </Link>

      </div>


      <div className="grid gap-4 md:grid-cols-3">

        <Link
          href={`/models/${model.id}/inputs`}
          className="rounded-lg border bg-background p-6 shadow-sm transition-colors hover:bg-muted/50"
        >

          <h2 className="font-semibold">
            Inputs
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Configure input definitions for this model.
          </p>

        </Link>


        <div className="rounded-lg border bg-background p-6 shadow-sm">

          <h2 className="font-semibold">
            Metrics
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Metric configuration will be added in a future phase.
          </p>

        </div>


        <div className="rounded-lg border bg-background p-6 shadow-sm">

          <h2 className="font-semibold">
            Scenarios
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Scenario configuration will be added in a future phase.
          </p>

        </div>

      </div>

    </div>

  );

}
