import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  getBusinessModelById,
} from "@/features/models/services/model-service";

import {
  getSavedModels,
} from "@/features/saved-values/services/saved-value-service";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  getModelAccess,
} from "@/lib/model-access";

import {
  Badge,
} from "@/components/ui/badge";


type SavedModelsPageProps = {
  params: Promise<{
    modelId: string;
  }>;
};


export default async function SavedModelsPage({
  params,
}: SavedModelsPageProps) {

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


  const savedModels =
    await getSavedModels(
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
            Saved Models
          </h1>


          <p className="mt-1 text-sm text-muted-foreground">

            Saved snapshots of the working values for{" "}

            <span className="font-medium text-foreground">
              {model.name}
            </span>

          </p>


          {!access.isOwner && (

            <p className="mt-2 text-xs text-muted-foreground">

              {access.isAdmin
                ? "Administrator access"
                : access.permission === "EDIT"
                  ? "Shared with edit access"
                  : "Shared with view access"}

            </p>

          )}

        </div>

      </div>


      {savedModels.length === 0 ? (

        <div className="rounded-lg border bg-background p-8">

          <h2 className="font-semibold">
            No saved models yet
          </h2>


          <p className="mt-2 text-sm text-muted-foreground">

            {access.permission === "EDIT"

              ? "Enter working values and use “Save Model” to create your first saved snapshot."

              : "There are no saved snapshots for this business model yet."}

          </p>


          {access.permission === "EDIT" && (

            <Link
              href={`/models/${model.id}/inputs`}
              className="
                mt-5
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
              Go to Inputs
            </Link>

          )}

        </div>

      ) : (

        <div className="space-y-4">

          {savedModels.map((savedModel:any) => (

            <Link
              key={savedModel.id}
              href={`/models/${model.id}/saved/${savedModel.id}`}
              className="
                block
                rounded-lg
                border
                bg-background
                p-6
                shadow-sm
                transition-colors
                hover:bg-muted/50
              "
            >

              <div className="flex items-start justify-between gap-6">

                <div className="space-y-2">

                  <h2 className="font-semibold">
                    {savedModel.name}
                  </h2>


                  <p className="text-sm text-muted-foreground">
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


              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                {savedModel.values
                  .slice(0, 6)
                  .map((savedValue:any) => (

                    <div
                      key={savedValue.id}
                      className="rounded-md border bg-muted/20 p-3"
                    >

                      <p className="text-xs text-muted-foreground">
                        {savedValue.input.name}
                      </p>


                      <p className="mt-1 font-medium">

                        {savedValue.value}

                        {savedValue.input.unit
                          ? ` ${savedValue.input.unit}`
                          : ""}

                      </p>

                    </div>

                  ))}

              </div>


              {savedModel.values.length > 6 && (

                <p className="mt-4 text-xs text-muted-foreground">

                  + {savedModel.values.length - 6} more values

                </p>

              )}

            </Link>

          ))}

        </div>

      )}

    </div>

  );

}
