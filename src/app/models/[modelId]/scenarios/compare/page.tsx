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
  compareScenarios,
} from "@/features/scenarios/services/scenario-comparison-service";

import {
  ScenarioComparisonTable,
} from "@/features/scenarios/components/scenario-comparison-table";


type ScenarioComparisonPageProps = {
  params: Promise<{
    modelId: string;
  }>;
};


export default async function ScenarioComparisonPage({
  params,
}: ScenarioComparisonPageProps) {

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


  if (model.createdBy !== user.id) {
    notFound();
  }


  const comparison =
    await compareScenarios(
      modelId,
      user.id
    );


  return (

    <div className="space-y-8">

      <div className="space-y-4">

        <Link
          href={`/models/${model.id}/scenarios`}
          className="
            text-sm
            text-muted-foreground
            hover:text-foreground
          "
        >
          ← Back to Scenarios
        </Link>


        <div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Scenario Comparison
          </h1>


          <p className="mt-1 text-sm text-muted-foreground">

            Compare calculated metrics across scenarios for{" "}

            <span className="font-medium text-foreground">
              {model.name}
            </span>

          </p>

        </div>

      </div>


      <div className="rounded-lg border bg-background">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold">
            Metrics Comparison
          </h2>


          <p className="mt-1 text-sm text-muted-foreground">
            Each value is calculated using the inputs stored in
            its respective scenario.
          </p>

        </div>


        <div className="p-6">

          <ScenarioComparisonTable
            scenarios={
              comparison.scenarios
            }
            metrics={
              comparison.metrics
            }
          />

        </div>

      </div>


      <div className="flex flex-wrap gap-3">

        <Link
          href={`/models/${model.id}/scenarios`}
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
          Back to Scenarios
        </Link>


        <Link
          href={`/models/${model.id}`}
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
          Back to Model
        </Link>

      </div>

    </div>

  );

}
