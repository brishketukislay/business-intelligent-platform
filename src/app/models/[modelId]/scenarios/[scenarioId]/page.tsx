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
  getScenarioById,
} from "@/features/scenarios/services/scenario-service";

import {
  getInputDefinitions,
} from "@/features/inputs/services/input-service";

import {
  getScenarioValues,
} from "@/features/scenarios/services/scenario-value-service";

import {
  ScenarioInputTable,
} from "@/features/scenarios/components/scenario-input-table";

import {
  Badge,
} from "@/components/ui/badge";

import {
  calculateScenarioMetrics,
} from "@/features/scenarios/services/scenario-calculation-service";

import {
  MetricResults,
} from "@/features/metrics/components/metric-results";


type ScenarioDetailPageProps = {
  params: Promise<{
    modelId: string;
    scenarioId: string;
  }>;
};


export default async function ScenarioDetailPage({
  params,
}: ScenarioDetailPageProps) {

  const {
    modelId,
    scenarioId,
  } = await params;


  if (!modelId || !scenarioId) {
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


  const scenario =
    await getScenarioById(
      scenarioId,
      user.id
    );


  if (!scenario) {
    notFound();
  }


  if (scenario.modelId !== modelId) {
    notFound();
  }


  const inputs =
    await getInputDefinitions(
      modelId,
      user.id
    );


  const scenarioValues =
    await getScenarioValues(
      scenarioId,
      user.id
    );

    const calculatedMetrics =
  await calculateScenarioMetrics(
    scenarioId,
    user.id
  );


  return (

    <div className="space-y-8">

      <div className="space-y-4">

        <div className="flex flex-wrap items-center gap-3">

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

            <div className="flex items-center gap-3">

              <h1 className="text-2xl font-semibold tracking-tight">
                {scenario.name}
              </h1>

              <Badge
                variant={
                  scenario.status === "ACTIVE"
                    ? "default"
                    : "secondary"
                }
              >
                {scenario.status}
              </Badge>

            </div>


            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">

              {scenario.description ??
                "No description provided."}

            </p>

          </div>

        </div>

      </div>


      <div className="rounded-lg border bg-background">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold">
            Scenario Inputs
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Enter values specific to this scenario. These values do not change your working values.
          </p>

        </div>


        <div className="p-6">

          <ScenarioInputTable
            modelId={model.id}
            scenarioId={scenario.id}
            inputs={inputs}
            values={scenarioValues}
          />

        </div>

      </div>
            <div className="rounded-lg border bg-background">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold">
            Calculated Metrics
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Metrics calculated using the values stored in this scenario.
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
          All Scenarios
        </Link>


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
          Working Values
        </Link>

      </div>

    </div>

  );

}
