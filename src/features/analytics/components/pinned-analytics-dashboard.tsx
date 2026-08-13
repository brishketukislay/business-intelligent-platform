"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  useState,
  useTransition,
} from "react";

import {
  ArrowRight,
  PinOff,
  Presentation,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  setAnalyticsChartPinnedAction,
} from "../actions/analytics-actions";

import {
  AnalyticsChart,
} from "./analytics-chart";

import {
  AnalyticsPresentation,
} from "./analytics-presentation";

import type {
  AnalyticsChartRecord,
  AnalyticsModelData,
} from "../types";

type Props = {
  charts: AnalyticsChartRecord[];
  modelMap: Map<
    string,
    AnalyticsModelData
  >;
};

export function PinnedAnalyticsDashboard({
  charts,
  modelMap,
}: Props) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    isPresentationMode,
    setIsPresentationMode,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const renderableCharts =
    charts.filter(
      (chart) =>
        modelMap.has(
          chart.modelId,
        ),
    );

  async function unpin(
    chart: AnalyticsChartRecord,
  ) {
    setError(null);

    startTransition(
      async () => {
        const result =
          await setAnalyticsChartPinnedAction(
            chart.id,
            false,
          );

        if (!result.success) {
          setError(
            result.error ??
              "Unable to unpin chart.",
          );

          return;
        }

        router.refresh();
      },
    );
  }

  if (
    renderableCharts.length ===
    0
  ) {
    return null;
  }

  return (
    <>
      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">
                Pinned analytics
              </h2>

              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {
                  renderableCharts.length
                }
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Your selected charts at a glance.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setIsPresentationMode(
                true,
              )
            }
            disabled={
              isPending
            }
          >
            <Presentation className="size-4" />
            Present
          </Button>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {renderableCharts.map(
            (chart) => {
              const model =
                modelMap.get(
                  chart.modelId,
                );

              if (!model) {
                return null;
              }

              return (
                <article
                  key={chart.id}
                  className="overflow-hidden rounded-2xl border bg-background shadow-sm"
                >
                  <div className="flex min-h-14 items-center justify-between gap-3 border-b px-4 py-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">
                        {chart.name}
                      </h3>

                      <p className="truncate text-xs text-muted-foreground">
                        {
                          model
                            .model
                            .name
                        }
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Link
                        href={`/models/${model.model.id}`}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        Open

                        <ArrowRight className="size-3.5" />
                      </Link>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={
                          isPending
                        }
                        onClick={() =>
                          unpin(
                            chart,
                          )
                        }
                        title="Unpin from dashboard"
                      >
                        <PinOff className="size-4" />

                        <span className="hidden sm:inline">
                          Unpin
                        </span>
                      </Button>
                    </div>
                  </div>

                  <div className="p-4">
                    <AnalyticsChart
                      modelData={
                        model
                      }
                      config={{
                        ...chart.config,
                        width:
                          undefined,
                        height: 300,
                      }}
                      compact
                    />
                  </div>
                </article>
              );
            },
          )}
        </div>
      </section>

      {isPresentationMode && (
        <AnalyticsPresentation
          charts={
            renderableCharts
          }
          modelMap={
            modelMap
          }
          onExit={() =>
            setIsPresentationMode(
              false,
            )
          }
        />
      )}
    </>
  );
}