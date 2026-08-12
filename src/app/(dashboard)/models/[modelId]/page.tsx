import {
  BarChart3,
  Database,
  Layers3,
  Table2,
} from "lucide-react";

import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";

import {
  getBusinessModelOverview,
} from "@/features/models/services/model-service";

import {
  calculateMetrics,
} from "@/features/metrics/services/metric-calculation-service";

import {
  getAnalyticsChartsForModel,
  getAnalyticsModelData,
} from "@/features/analytics/services/analytics-service";

import {
  ModelWorkspace,
} from "@/features/models/components/model-workspace";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  getModelShares,
} from "@/features/models/actions/model-sharing-actions";

import {
  ModelSharingDialog,
} from "@/features/models/components/model-sharing-dialog";

import {
  ModelEditLink,
} from "@/features/models/components/model-edit-link";

import {
  MODEL_TYPE_LABELS,
  type ModelType,
} from "@/features/models/types";

type Props = {
  params: Promise<{
    modelId: string;
  }>;
};

export default async function ModelDetailPage({
  params,
}: Props) {
  const { modelId } = await params;

  if (!modelId) {
    notFound();
  }

  const user = await requireCurrentUser();

  const [
    overview,
    metrics,
    analyticsModel,
    analyticsCharts,
  ] = await Promise.all([
    getBusinessModelOverview(
      modelId,
      user.id,
    ),

    calculateMetrics(
      modelId,
      user.id,
    ),

    getAnalyticsModelData(
      modelId,
      user.id,
    ),

    getAnalyticsChartsForModel(
      modelId,
      user.id,
    ),
  ]);

  if (!overview) {
    notFound();
  }

  const {
    model,
    completion,
  } = overview;

  let shares: Awaited<
    ReturnType<typeof getModelShares>
  > = [];

  let canManageSharing = false;

  try {
    shares = await getModelShares(
      model.id,
      user.id,
    );

    canManageSharing = true;
  } catch {
    canManageSharing = false;
  }

  const modelType =
    MODEL_TYPE_LABELS[
      model.modelType as ModelType
    ] ?? "Custom";

  const usesItems =
    model.itemLabelSingular !== "Item" ||
    model._count.items > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {modelType}
            </Badge>

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

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {model.name}
          </h1>

          {model.description && (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {model.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {canManageSharing && (
            <ModelSharingDialog
              modelId={model.id}
              currentUserId={user.id}
              shares={shares}
            />
          )}

          <ModelEditLink
            modelId={model.id}
          />
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={
            <Database className="size-5" />
          }
          label="Data completion"
          value={`${completion}%`}
          description="Values entered"
        />

        <SummaryCard
          icon={
            <BarChart3 className="size-5" />
          }
          label="Calculated results"
          value={String(overview.metrics)}
          description="Automatic KPIs"
        />

        <SummaryCard
          icon={
            <Table2 className="size-5" />
          }
          label="Measures"
          value={String(overview.inputs)}
          description="Numbers being tracked"
        />

        <SummaryCard
          icon={
            <Layers3 className="size-5" />
          }
          label={model.itemLabelPlural}
          value={String(overview.items)}
          description="Tracked entities"
        />
      </section>

      <ModelWorkspace
        model={{
          id: model.id,
          itemLabelPlural:
            model.itemLabelPlural,
        }}
        metrics={metrics}
        analyticsModel={analyticsModel}
        charts={analyticsCharts}
        usesItems={usesItems}
      />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="text-primary">
          {icon}
        </div>

        {label}
      </div>

      <div className="mt-3 text-3xl font-semibold tracking-tight">
        {value}
      </div>

      <div className="mt-1 text-xs text-muted-foreground">
        {description}
      </div>
    </div>
  );
}