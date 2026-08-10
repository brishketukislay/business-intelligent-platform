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
  getModelAccess,
} from "@/lib/model-access";

import {
  prisma,
} from "@/lib/prisma";

import {
  Badge,
} from "@/components/ui/badge";

import {
  ScenarioInputs,
} from "@/features/scenarios/components/scenario-inputs";

import {
  ScenarioEditForm,
} from "@/features/scenarios/components/scenario-edit-form";

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


  const access =
    await getModelAccess(
      modelId,
      user.id
    );


  if (!access) {
    notFound();
  }


  const model =
    await getBusinessModelById(
      modelId,
      user.id
    );


  if (!model) {
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


  const calculatedMetrics =
    await calculateScenarioMetrics(
      scenarioId,
      user.id
    );


  const inputs =
    await prisma.inputDefinition.findMany({

      where: {

        modelId,

        status: "ACTIVE",

      },

      orderBy: {

        createdAt: "asc",

      },

    });


  const scenarioValueByInputId =
    new Map(
      scenario.values.map(
        (scenarioValue) => [
          scenarioValue.inputId,
          scenarioValue.value,
        ]
      )
    );


  const scenarioInputs =
    inputs.map(
      (input) => ({

        id: input.id,

        modelId: input.modelId,

        name: input.name,

        key: input.key,

        type: input.type,

        unit: input.unit,

        category: input.category,

        value:
          scenarioValueByInputId.get(
            input.id
          ) ?? "",

      })
    );


  const canEdit =
    access.permission === "EDIT";


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


            <p className="mt-1 text-sm text-muted-foreground">

              {scenario.description ??
                "No description provided."}

            </p>


            <p className="mt-2 text-xs text-muted-foreground">

              Created{" "}
              {scenario.createdAt.toLocaleString()}

            </p>


            {!access.isOwner && (

              <p className="mt-2 text-xs text-muted-foreground">

                {access.isAdmin
                  ? "Administrator access"
                  : canEdit
                    ? "Shared with edit access"
                    : "Shared with view access"}

              </p>

            )}

          </div>

        </div>

      </div>


      <div className="rounded-lg border bg-background">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold">
            Scenario Inputs
          </h2>


          <p className="mt-1 text-sm text-muted-foreground">

            {canEdit
              ? "Configure the input values used by this scenario."
              : "View the input values used by this scenario."}

          </p>

        </div>


        <div className="p-0">

          <ScenarioInputs
            scenarioId={scenario.id}
            modelId={model.id}
            inputs={scenarioInputs}
            readOnly={!canEdit}
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


      {canEdit && (

        <ScenarioEditForm
          modelId={model.id}
          scenarioId={scenario.id}
          initialName={scenario.name}
          initialDescription={
            scenario.description ?? ""
          }
          status={scenario.status}
        />

      )}


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
          View Working Inputs
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