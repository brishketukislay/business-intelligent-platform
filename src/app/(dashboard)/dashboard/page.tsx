import Link from "next/link";

import {
  ArrowRight,
  BarChart3,
  Plus,
} from "lucide-react";

import {
  getBusinessModels,
} from "@/features/models/services/model-service";

import {
  ModelList,
} from "@/features/models/components/model-list";

import {
  PinnedAnalyticsDashboard,
} from "@/features/analytics/components/pinned-analytics-dashboard";

import {
  getAnalyticsDashboardData,
} from "@/features/analytics/services/analytics-service";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import type {
  AnalyticsModelData,
} from "@/features/analytics/types";

export default async function DashboardPage() {
  const user =
    await requireCurrentUser();

  const [
    models,
    analytics,
  ] = await Promise.all([
    getBusinessModels(
      user.id,
    ),
    getAnalyticsDashboardData(
      user.id,
    ),
  ]);

  const activeModels =
    models.filter(
      (model) =>
        model.status ===
        "ACTIVE",
    );

  const modelMap =
    new Map<string, AnalyticsModelData>(
      analytics.models.map(
        (model) => [
          model.model.id,
          model,
        ],
      ),
    );

  const pinnedCharts =
    analytics.charts.filter(
      (chart) =>
        chart.config.isPinned ===
        true,
    );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            Performance overview
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            How is everything doing?
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Open a tracker to update performance data,
            review results or investigate an area of
            the business.
          </p>
        </div>

        <Link
          href="/models"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          View trackers
          <ArrowRight className="size-4" />
        </Link>
      </header>

      {activeModels.length === 0 ? (
        <EmptyDashboard />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Active trackers"
              value={String(
                activeModels.length,
              )}
            />

            <SummaryCard
              label="Measures"
              value={String(
                activeModels.reduce(
                  (
                    total,
                    model,
                  ) =>
                    total +
                    (
                      model
                        ._count
                        ?.inputs ??
                      0
                    ),
                  0,
                ),
              )}
            />

            <SummaryCard
              label="Calculated results"
              value={String(
                activeModels.reduce(
                  (
                    total,
                    model,
                  ) =>
                    total +
                    (
                      model
                        ._count
                        ?.metrics ??
                      0
                    ),
                  0,
                ),
              )}
            />
          </section>

          {pinnedCharts.length > 0 && (
            <PinnedAnalyticsDashboard
              charts={
                pinnedCharts
              }
              modelMap={
                modelMap
              }
            />
          )}

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Your trackers
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Everything you're currently tracking.
                </p>
              </div>

              <Link
                href="/models"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View all
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <ModelList
              models={
                activeModels
              }
            />
          </section>

          <section className="rounded-2xl border bg-muted/20 p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BarChart3 className="size-5" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Need deeper analysis?
                </h2>

                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Advanced charts, scenarios and saved
                  analysis are available from each
                  tracker. Pin important charts to keep
                  them visible here on your dashboard.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function EmptyDashboard() {
  return (
    <div className="rounded-2xl border border-dashed p-12 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10">
        <Plus className="size-6 text-primary" />
      </div>

      <h2 className="mt-4 text-lg font-semibold">
        Start tracking performance
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Create a company, project, individual,
        customer, sales or custom tracker to get
        started.
      </p>
    </div>
  );
}