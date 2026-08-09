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
  getSavedModelById,
} from "@/features/saved-values/services/saved-value-service";

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


  const savedModel =
    await getSavedModelById(
      modelId,
      savedModelId,
      user.id
    );


  if (!savedModel) {
    notFound();
  }


  return (

    <div className="space-y-8">

      {/* Header */}

      <div className="space-y-3">

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


        <div className="flex items-start justify-between gap-6">

          <div>

            <h1 className="text-2xl font-semibold tracking-tight">
              {savedModel.name}
            </h1>


            <p className="mt-1 text-sm text-muted-foreground">
              Saved snapshot for{" "}

              <span className="font-medium text-foreground">
                {model.name}
              </span>
            </p>


            <p className="mt-1 text-xs text-muted-foreground">
              Created{" "}
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


      {/* Saved Values */}

      <div className="rounded-lg border bg-background">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold">
            Saved Input Values
          </h2>


          <p className="mt-1 text-sm text-muted-foreground">
            The input assumptions captured in this snapshot.
          </p>

        </div>


        {savedModel.values.length === 0 ? (

          <div className="p-6">

            <p className="text-sm text-muted-foreground">
              This saved model contains no input values.
            </p>

          </div>

        ) : (

          <div className="divide-y">

            {savedModel.values.map(
              (savedValue) => (

                <div
                  key={savedValue.id}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-6
                    px-6
                    py-4
                  "
                >

                  <div>

                    <p className="font-medium">
                      {savedValue.input.name}
                    </p>


                    <p className="mt-1 text-xs text-muted-foreground">
                      {savedValue.input.key}

                      {savedValue.input.category
                        ? ` · ${savedValue.input.category}`
                        : ""}
                    </p>

                  </div>


                  <div className="text-right">

                    <p className="font-semibold">
                      {savedValue.value}

                      {savedValue.input.unit
                        ? ` ${savedValue.input.unit}`
                        : ""}

                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* Navigation */}

      <div className="flex flex-wrap gap-3">

        <Link
          href={`/models/${model.id}/saved`}
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
          Back to Saved Models
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
          View Current Inputs
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
