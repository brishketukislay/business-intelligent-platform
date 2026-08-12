"use client";

import Link from "next/link";

import {
  BarChart3,
  Layers3,
  Table2,
} from "lucide-react";

import { MetricResults } from "@/features/metrics/components/metric-results";
import AnalyticsWorkspace from "@/features/analytics/components/analytics-workspace";

import type {
  AnalyticsChartRecord,
  AnalyticsModelData,
} from "@/features/analytics/types";

type Props = {
  model: {
    id: string;
    itemLabelPlural: string;
  };
  metrics: Awaited<
    ReturnType<
      typeof import("@/features/metrics/services/metric-calculation-service").calculateMetrics
    >
  >;
  analyticsModel: AnalyticsModelData;
  charts: AnalyticsChartRecord[];
  usesItems: boolean;
};

export function ModelWorkspace({
  model,
  metrics,
  analyticsModel,
  charts,
  usesItems,
}: Props) {
  return (
    <div className="space-y-8">
      {metrics.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Current performance
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Automatically calculated from your latest data.
            </p>
          </div>

          <MetricResults metrics={metrics} />
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <WorkspaceCard
          href={`/models/${model.id}/inputs`}
          icon={<Table2 className="size-5" />}
          title="Enter performance data"
          description={
            usesItems
              ? `Update ${model.itemLabelPlural.toLowerCase()} and their performance values.`
              : "Update your reporting figures for each period."
          }
          primary
        />

        {usesItems ? (
          <WorkspaceCard
            href={`/models/${model.id}/items`}
            icon={<Layers3 className="size-5" />}
            title={`Manage ${model.itemLabelPlural.toLowerCase()}`}
            description={`Add and manage the ${model.itemLabelPlural.toLowerCase()} being tracked.`}
          />
        ) : (
          <WorkspaceCard
            href={`/models/${model.id}/metrics`}
            icon={<BarChart3 className="size-5" />}
            title="View calculated results"
            description="Review KPIs and performance across reporting periods."
          />
        )}

        <WorkspaceCard
          href={`/models/${model.id}/scenarios`}
          icon={<BarChart3 className="size-5" />}
          title="Scenarios"
          description="Model alternative assumptions and compare outcomes."
        />
      </section>

      <section
        id="analytics"
        className="scroll-mt-6"
      >
        <AnalyticsWorkspace
          models={[analyticsModel]}
          charts={charts}
        />
      </section>

      <section className="rounded-2xl border bg-muted/20 p-6">
        <div>
          <h2 className="font-semibold">
            Model configuration
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the model structure, periods, measures and saved
            snapshots.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/models/${model.id}/inputs`}
            className="rounded-md border bg-background px-3 py-2 text-sm transition hover:bg-muted"
          >
            Measures
          </Link>

          <Link
            href={`/models/${model.id}/metrics`}
            className="rounded-md border bg-background px-3 py-2 text-sm transition hover:bg-muted"
          >
            Calculated results
          </Link>

          {usesItems && (
            <Link
              href={`/models/${model.id}/items`}
              className="rounded-md border bg-background px-3 py-2 text-sm transition hover:bg-muted"
            >
              {model.itemLabelPlural}
            </Link>
          )}

          <Link
            href={`/models/${model.id}/scenarios`}
            className="rounded-md border bg-background px-3 py-2 text-sm transition hover:bg-muted"
          >
            Scenarios
          </Link>

          <Link
            href={`/models/${model.id}/saved`}
            className="rounded-md border bg-background px-3 py-2 text-sm transition hover:bg-muted"
          >
            Saved snapshots
          </Link>

          <Link
            href={`/models/${model.id}/edit`}
            className="rounded-md border bg-background px-3 py-2 text-sm transition hover:bg-muted"
          >
            Edit model
          </Link>
        </div>
      </section>
    </div>
  );
}

function WorkspaceCard({
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

        <span className="text-xs font-medium text-muted-foreground transition group-hover:text-primary">
          Open
        </span>
      </div>

      <h3 className="mt-5 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>
    </Link>
  );
}