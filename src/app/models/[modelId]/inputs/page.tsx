import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  getBusinessModelById,
} from "@/features/models/services/model-service";

import {
  getInputDefinitions,
} from "@/features/inputs/services/input-service";

import {
  InputTable,
} from "@/features/inputs/components/input-table";

import {
  InputForm,
} from "@/features/inputs/components/input-form";


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


  const model =
    await getBusinessModelById(
      modelId
    );


  if (!model) {
    notFound();
  }


  const inputs =
    await getInputDefinitions(
      modelId
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

              Configure input definitions for{" "}

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


      <div className="rounded-lg border bg-background">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold">
            Input Definitions
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Inputs configured for this business model.
          </p>

        </div>


        <div className="p-6">

          <InputTable
            inputs={inputs}
          />

        </div>

      </div>

    </div>

  );

}
