import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  getBusinessModelById,
} from "@/features/models/services/model-service";

import {
  ModelEditForm,
} from "@/features/models/components/model-edit-form";

import {
  requireCurrentUser,
} from "@/lib/current-user";


type ModelEditPageProps = {
  params: Promise<{
    modelId: string;
  }>;
};


export default async function ModelEditPage({
  params,
}: ModelEditPageProps) {

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


  return (

    <div className="mx-auto max-w-2xl space-y-8">

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
            Edit Business Model
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Update the configuration for this business model.
          </p>

        </div>

      </div>


      <div className="rounded-lg border bg-background p-6 shadow-sm">

        <ModelEditForm
          model={model}
        />

      </div>

    </div>

  );

}
