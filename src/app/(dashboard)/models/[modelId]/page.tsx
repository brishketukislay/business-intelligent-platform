import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  getBusinessModelById,
} from "@/features/models/services/model-service";

import {
  getModelShares,
} from "@/features/models/actions/model-sharing-actions";

import {
  ModelSharingDialog,
} from "@/features/models/components/model-sharing-dialog";

import {
  ModelEditDialog,
} from "@/features/models/components/model-edit-dialog";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  Badge,
} from "@/components/ui/badge";

type ModelPageProps = {
  params: Promise<{
    modelId: string;
  }>;
};

export default async function ModelDetailPage({
  params,
}: ModelPageProps) {
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

  let shares:
    Awaited<
      ReturnType<typeof getModelShares>
    > = [];

  let canManageSharing =
    false;

  try {
    shares =
      await getModelShares(
        modelId,
        user.id
      );

    canManageSharing =
      true;
  } catch {
    canManageSharing =
      false;
  }

  return (
    <div className="space-y-8">
      <div
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1
              className="
                text-2xl
                font-semibold
                tracking-tight
              "
            >
              {model.name}
            </h1>

            <Badge
              variant={
                model.status === "ACTIVE"
                  ? "default"
                  : "secondary"
              }
            >
              {model.status}
            </Badge>
          </div>

          <p
            className="
              max-w-2xl
              text-sm
              text-muted-foreground
            "
          >
            {model.description ??
              "No description provided."}
          </p>
        </div>

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
          "
        >
          {canManageSharing && (
            <ModelSharingDialog
              modelId={model.id}
              currentUserId={user.id}
              shares={shares}
            />
          )}

          <ModelEditDialog
            model={model}
          />
        </div>
      </div>

      <div
        className="
          grid
          gap-4
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        <Link
          href={`/models/${model.id}/inputs`}
          className="
            rounded-lg
            border
            bg-background
            p-6
            shadow-sm
            transition-colors
            hover:bg-muted/50
          "
        >
          <h2 className="font-semibold">
            Inputs
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-muted-foreground
            "
          >
            Configure input definitions for this model.
          </p>
        </Link>

        <Link
          href={`/models/${model.id}/saved`}
          className="
            rounded-lg
            border
            bg-background
            p-6
            shadow-sm
            transition-colors
            hover:bg-muted/50
          "
        >
          <h2 className="font-semibold">
            Saved Models
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-muted-foreground
            "
          >
            View saved snapshots of this model.
          </p>
        </Link>

        <Link
          href={`/models/${model.id}/metrics`}
          className="
            rounded-lg
            border
            bg-background
            p-6
            shadow-sm
            transition-colors
            hover:bg-muted/50
          "
        >
          <h2 className="font-semibold">
            Metrics
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-muted-foreground
            "
          >
            Configure calculated metrics for this model.
          </p>
        </Link>

        <Link
          href={`/models/${model.id}/scenarios`}
          className="
            rounded-lg
            border
            bg-background
            p-6
            shadow-sm
            transition-colors
            hover:bg-muted/50
          "
        >
          <h2 className="font-semibold">
            Scenarios
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-muted-foreground
            "
          >
            Create alternative assumptions and compare outcomes.
          </p>
        </Link>

        <Link
          href={`/models/${model.id}/items`}
          className="
            rounded-lg
            border
            bg-background
            p-6
            shadow-sm
            transition-colors
            hover:bg-muted/50
          "
        >
          <h2 className="font-semibold">
            {model.itemLabelPlural}
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-muted-foreground
            "
          >
            Track individual items and analyse
            performance across the whole model.
          </p>
        </Link>
      </div>
    </div>
  );
}