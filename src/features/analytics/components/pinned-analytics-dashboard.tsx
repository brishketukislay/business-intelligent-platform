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
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  setAnalyticsChartPinnedAction,
} from "../actions/analytics-actions";

import {
  AnalyticsChart,
} from "./analytics-chart";

import type {
  AnalyticsChartRecord,
  AnalyticsModelData,
} from "../types";

type Props = {
  charts: AnalyticsChartRecord[];
  models: AnalyticsModelData[];
};

export function PinnedAnalyticsDashboard({
  charts,
  models,
}: Props) {
  const router = useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const modelMap =
    new Map(
      models.map(
        (model) => [
          model.model.id,
          model,
        ],
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

  /*
   * Keep the dashboard quiet when the user
   * has not pinned anything yet.
   */
  if (charts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Pinned analytics
          </h2>

          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {charts.length}
          </span>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Your selected charts at a glance.
        </p>
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
        {charts.map((chart) => {
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
                    {model.model.name}
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
                      unpin(chart)
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
                  modelData={model}
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
        })}
      </div>
    </section>
  );
}