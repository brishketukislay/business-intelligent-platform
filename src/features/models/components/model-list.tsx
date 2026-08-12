"use client";

import Link from "next/link";

import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Database,
} from "lucide-react";

import type {
  BusinessModelRecord,
} from "../types";

import {
  MODEL_TYPE_LABELS,
} from "../types";

type Props = {
  models: BusinessModelRecord[];
};

export function ModelList({
  models,
}: Props) {
  if (!models.length) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10">
          <BarChart3 className="size-6 text-primary" />
        </div>

        <h2 className="mt-4 text-lg font-semibold">
          Nothing to track yet
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Create your first tracker and we'll set up
          the measures, periods and calculations for
          you.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {models.map((model) => {
        const inputCount =
          model._count?.inputs ?? 0;

        const metricCount =
          model._count?.metrics ?? 0;

        const periodCount =
          model._count?.periods ?? 0;

        return (
          <Link
            key={model.id}
            href={`/models/${model.id}`}
            className="group rounded-2xl border bg-background p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-wide text-primary">
                  {MODEL_TYPE_LABELS[
                    model.modelType as keyof typeof MODEL_TYPE_LABELS
                  ] ?? "Custom"}
                </div>

                <h2 className="mt-1 truncate text-lg font-semibold">
                  {model.name}
                </h2>
              </div>

              <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>

            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
              {model.description ??
                "Performance tracker"}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <Stat
                icon={
                  <Database className="size-3.5" />
                }
                value={inputCount}
                label="Measures"
              />

              <Stat
                icon={
                  <BarChart3 className="size-3.5" />
                }
                value={metricCount}
                label="Calculations"
              />

              <Stat
                icon={
                  <CalendarDays className="size-3.5" />
                }
                value={periodCount}
                label="Periods"
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-2.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">
          {label}
        </span>
      </div>

      <div className="mt-1 text-sm font-semibold">
        {value}
      </div>
    </div>
  );
}