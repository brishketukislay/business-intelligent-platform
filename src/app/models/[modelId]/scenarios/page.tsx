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
  ScenarioForm,
} from "@/features/scenarios/components/scenario-form";

import {
  ScenarioList,
} from "@/features/scenarios/components/scenario-list";


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


  const scenarios =
    await getScenarios(
      modelId,
      user.id
    );


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
            Create and manage alternative assumptions for{" "}

            <span className="font-medium text-foreground">
              {model.name}
            </span>
          </p>

        </div>

      </div>


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
        />

      </div>

    </div>

  );

}
