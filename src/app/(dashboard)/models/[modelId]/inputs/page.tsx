import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  SaveModelValuesButton,
} from "@/features/saved-values/components/save-model-values-button";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  getBusinessModelById,
} from "@/features/models/services/model-service";

import {
  getInputDefinitions,
  getInputPeriodData,
} from "@/features/inputs/services/input-service";

import {
  InputTable,
} from "@/features/inputs/components/input-table";

import {
  InputForm,
} from "@/features/inputs/components/input-form";

import {
  getWorkingValues,
} from "@/features/working-values/services/working-value-service";

import {
  WorkingValuesForm,
} from "@/features/working-values/components/working-values-form";


type ModelInputsPageProps = {

  params: Promise<{
    modelId: string;
  }>;

};


export default async function ModelInputsPage({
  params,
}: ModelInputsPageProps) {

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


  const [
    inputs,
    workingValues,
    periodData,
  ] = await Promise.all([

    getInputDefinitions(
      modelId,
      user.id
    ),

    getWorkingValues(
      modelId,
      user.id
    ),

    getInputPeriodData(
      modelId,
      user.id
    ),

  ]);


  const workingValueMap =
    new Map(
      workingValues.map(
        workingValue => [
          workingValue.inputId,
          workingValue.value,
        ]
      )
    );


  const workingInputs =
    inputs.map(
      input => ({

        id: input.id,

        name: input.name,

        key: input.key,

        type: input.type,

        unit: input.unit,

        category: input.category,

        value:
          workingValueMap.get(
            input.id
          ) ?? null,

      })
    );


  return (

    <div className="space-y-8">

      <div className="flex items-start justify-between gap-6">

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
              Inputs
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">

              Configure input definitions and values for{" "}

              <span className="font-medium text-foreground">
                {model.name}
              </span>

            </p>

          </div>

        </div>


        <div className="rounded-lg border bg-background p-5">

          <InputForm
            modelId={model.id}
          />

        </div>

      </div>


      {/* Existing Working Values */}

      <div className="rounded-lg border bg-background">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold">
            Working Values
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Current model-level values. Existing functionality is unchanged.
          </p>

        </div>


        <div className="p-6">

          <WorkingValuesForm
            modelId={model.id}
            inputs={workingInputs}
          />

          <div className="mt-6 border-t pt-6">

            <SaveModelValuesButton
              modelId={model.id}
            />

          </div>

        </div>

      </div>


      {/* Monthly Values + Definitions */}

      <div className="rounded-lg border bg-background">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold">
            Monthly Inputs
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Enter the raw monthly values used by period-based calculations.
          </p>

        </div>


        <div className="p-6">

          <InputTable
  modelId={model.id}
  inputs={inputs}
  periods={periodData.periods}
  periodValues={periodData.values}
/>

        </div>

      </div>

    </div>

  );

}
