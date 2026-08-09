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
prisma,
} from "@/lib/prisma";

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

if (model.createdBy !== user.id) {
notFound();
}

const savedModel =
await prisma.savedModel.findFirst({

  where: {

    id: savedModelId,

    modelId,

    createdBy: user.id,

  },

  include: {

    values: {

      include: {
        input: true,
      },

      orderBy: {
        input: {
          createdAt: "asc",
        },
      },

    },

  },

});


if (!savedModel) {
notFound();
}

return (

<div className="space-y-8">

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

        <div className="flex items-center gap-3">

          <h1 className="text-2xl font-semibold tracking-tight">
            {savedModel.name}
          </h1>

          <Badge variant="secondary">
            Snapshot
          </Badge>

        </div>


        <p className="mt-2 text-sm text-muted-foreground">
          {model.name}
          {" · "}
          {savedModel.createdAt.toLocaleString()}
        </p>

      </div>

    </div>

  </div>


  <div className="rounded-lg border bg-background">

    <div className="border-b px-6 py-4">

      <h2 className="font-semibold">
        Saved Values
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        These values were captured when this snapshot was saved.
      </p>

    </div>


    {savedModel.values.length === 0 ? (

      <div className="p-6 text-sm text-muted-foreground">
        This snapshot contains no values.
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

                <p className="mt-1 text-xs text-muted-foreground">
                  {savedValue.input.type}
                </p>

              </div>

            </div>

          )
        )}

      </div>

    )}

  </div>


  <div>

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
      Back to Working Values
    </Link>

  </div>

</div>


);

}