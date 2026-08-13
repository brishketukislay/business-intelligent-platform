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
  AnalyticsChart,
} from "@/features/analytics/components/analytics-chart";

import {
  getAnalyticsDashboardData,
} from "@/features/analytics/services/analytics-service";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import type {
  AnalyticsChartRecord,
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
                    (model
                      ._count
                      ?.inputs ??
                      0),
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
                    (model
                      ._count
                      ?.metrics ??
                      0),
                  0,
                ),
              )}
            />
          </section>

          {pinnedCharts.length > 0 && (
            <PinnedAnalytics
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

function PinnedAnalytics({
  charts,
  modelMap,
}: {
  charts: AnalyticsChartRecord[];
  modelMap: Map<
    string,
    AnalyticsModelData
  >;
}) {
  const renderableCharts =
    charts.filter(
      (chart) =>
        modelMap.has(
          chart.modelId,
        ),
    );

  if (
    renderableCharts.length ===
    0
  ) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PinIcon />

            <h2 className="text-xl font-semibold">
              Pinned analytics
            </h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Your selected charts at a glance.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {renderableCharts.map(
          (chart) => {
            const model =
              modelMap.get(
                chart.modelId,
              );

            if (!model) {
              return null;
            }

            const width =
              chart.config.width ??
              560;

            const height =
              chart.config.height ??
              360;

            return (
              <article
                key={chart.id}
                className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm"
              >
                <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">
                      {chart.name}
                    </h3>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {model.model.name}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
                    Pinned
                  </span>
                </div>

                <div className="p-4">
                  <AnalyticsChart
                    modelData={
                      model
                    }
                    config={{
                      ...chart.config,
                      width,
                      height:
                        Math.max(
                          280,
                          height -
                            48,
                        ),
                    }}
                  />
                </div>
              </article>
            );
          },
        )}
      </div>
    </section>
  );
}

function PinIcon() {
  return (
    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden="true"
      >
        <path d="M12 17v5" />
        <path d="M5 3h14" />
        <path d="M6 3l1 7a5 5 0 0 0 10 0l1-7" />
        <path d="M5 10h14" />
      </svg>
    </span>
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