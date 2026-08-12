import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowRight,
  BarChart3,
  Database,
  Layers3,
  Settings2,
  Table2,
} from "lucide-react";

import {
  Badge,
} from "@/components/ui/badge";

import {
  getBusinessModelOverview,
} from "@/features/models/services/model-service";

import {
  calculateMetrics,
} from "@/features/metrics/services/metric-calculation-service";

import {
  MetricResults,
} from "@/features/metrics/components/metric-results";

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
  ModelEditDialog,
} from "@/features/models/components/model-edit-dialog";

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
  const {
    modelId,
  } = await params;

  if (!modelId) {
    notFound();
  }

  const user =
    await requireCurrentUser();

  const overview =
    await getBusinessModelOverview(
      modelId,
      user.id,
    );

  if (!overview) {
    notFound();
  }

  const metrics =
    await calculateMetrics(
      modelId,
      user.id,
    );

  const {
    model,
    completion,
  } = overview;

  let shares:
    Awaited<
      ReturnType<typeof getModelShares>
    > = [];

  let canManageSharing =
    false;

  try {
    shares =
      await getModelShares(
        model.id,
        user.id,
      );

    canManageSharing =
      true;
  } catch {
    canManageSharing =
      false;
  }

  const modelType =
    MODEL_TYPE_LABELS[
      model.modelType as ModelType
    ] ?? "Custom";

  const usesItems =
    model.itemLabelSingular !==
      "Item" ||
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
                model.status ===
                "ACTIVE"
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

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {model.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canManageSharing && (
            <ModelSharingDialog
              modelId={
                model.id
              }
              currentUserId={
                user.id
              }
              shares={shares}
            />
          )}

          <ModelEditDialog
            model={model}
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
          value={String(
            overview.metrics,
          )}
          description="Automatic KPIs"
        />

        <SummaryCard
          icon={
            <Table2 className="size-5" />
          }
          label="Measures"
          value={String(
            overview.inputs,
          )}
          description="Numbers being tracked"
        />

        <SummaryCard
          icon={
            <Layers3 className="size-5" />
          }
          label={
            model.itemLabelPlural
          }
          value={String(
            overview.items,
          )}
          description="Tracked entities"
        />
      </section>

      {metrics.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Current performance
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Automatically calculated from your
              latest data.
            </p>
          </div>

          <MetricResults
            metrics={metrics}
          />
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <ActionCard
          href={`/models/${model.id}/inputs`}
          icon={
            <Table2 className="size-5" />
          }
          title="Enter performance data"
          description={
            usesItems
              ? `Update ${model.itemLabelPlural.toLowerCase()} and their performance values.`
              : "Update your reporting figures for each period."
          }
          primary
        />

        {usesItems ? (
          <ActionCard
            href={`/models/${model.id}/items`}
            icon={
              <Layers3 className="size-5" />
            }
            title={`Manage ${model.itemLabelPlural.toLowerCase()}`}
            description={`Add and manage the ${model.itemLabelPlural.toLowerCase()} being tracked.`}
          />
        ) : (
          <ActionCard
            href={`/models/${model.id}/metrics`}
            icon={
              <BarChart3 className="size-5" />
            }
            title="View calculated results"
            description="Review KPIs and performance across reporting periods."
          />
        )}
      </section>

      <section className="rounded-2xl border bg-muted/20 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">
              Advanced configuration
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Most users won't need these options.
            </p>
          </div>

          <Settings2 className="size-5 text-muted-foreground" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/models/${model.id}/inputs`}
            className="rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted"
          >
            Measures
          </Link>

          <Link
            href={`/models/${model.id}/metrics`}
            className="rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted"
          >
            Calculated results
          </Link>

          {usesItems && (
            <Link
              href={`/models/${model.id}/items`}
              className="rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted"
            >
              {model.itemLabelPlural}
            </Link>
          )}

          <Link
            href={`/models/${model.id}/scenarios`}
            className="rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted"
          >
            Scenarios
          </Link>

          <Link
            href={`/models/${model.id}/saved`}
            className="rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted"
          >
            Saved snapshots
          </Link>
        </div>
      </section>
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

function ActionCard({
  href,
  icon,
  title,
  description,
  primary = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl border p-6 transition hover:-translate-y-0.5 hover:shadow-md ${
        primary
          ? "border-primary/30 bg-primary/[0.03]"
          : "bg-background"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>

        <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
      </div>

      <h2 className="mt-5 font-semibold">
        {title}
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>
    </Link>
  );
}