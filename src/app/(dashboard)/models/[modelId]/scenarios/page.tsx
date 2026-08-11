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
  getScenarios,
} from "@/features/scenarios/services/scenario-service";

import {
  getModelAccess,
} from "@/lib/model-access";

import {
  ScenarioForm,
} from "@/features/scenarios/components/scenario-form";

import {
  ScenarioList,
} from "@/features/scenarios/components/scenario-list";

import {
  ScenarioComparison,
} from "@/features/scenarios/components/scenario-comparison";


type ModelScenariosPageProps = {
  params: Promise<{
    modelId: string;
  }>;
};


export default async function ModelScenariosPage({
  params,
}: ModelScenariosPageProps) {

  const {
    modelId,
  } = await params;


  if (!modelId) {
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


  const scenarios =
    await getScenarios(
      modelId,
      user.id
    );


  const canEdit =
    access.permission === "EDIT";


  return (

    <div className="space-y-8">

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
            Scenarios
          </h1>


          <p className="mt-1 text-sm text-muted-foreground">

            Alternative versions of{" "}

            <span className="font-medium text-foreground">
              {model.name}
            </span>

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


      {canEdit && (

        <div className="rounded-lg border bg-background p-6">

          <div className="mb-6">

            <h2 className="font-semibold">
              Create Scenario
            </h2>


            <p className="mt-1 text-sm text-muted-foreground">
              Create a scenario before entering its input values.
            </p>

          </div>


          <ScenarioForm
            modelId={model.id}
          />

        </div>

      )}


      <div>

        <div className="mb-4">

          <h2 className="font-semibold">
            Existing Scenarios
          </h2>


          <p className="mt-1 text-sm text-muted-foreground">
            Alternative versions of this business model.
          </p>

        </div>


        <ScenarioList
  modelId={model.id}
  scenarios={scenarios}
  canEdit={canEdit}
/>


        <ScenarioComparison
          modelId={model.id}
        />

      </div>

    </div>

  );

}
