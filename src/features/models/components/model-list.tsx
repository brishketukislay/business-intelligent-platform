"use client";

import Link from "next/link";

import {
  ArrowRight,
  BarChart3,
  Database,
  Layers3,
} from "lucide-react";

import {
  Badge,
} from "@/components/ui/badge";

import type {
  BusinessModelRecord,
} from "../types";

import {
  MODEL_TYPE_LABELS,
  type ModelType,
} from "../types";

type ModelListProps = {
  models: BusinessModelRecord[];
};

export function ModelList({
  models,
}: ModelListProps) {
  if (models.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-background p-12 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10">
          <BarChart3 className="size-6 text-primary" />
        </div>

        <h2 className="mt-4 text-lg font-semibold">
          Nothing to track yet
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Create your first tracker and we'll configure
          the right measures, reporting periods and
          calculations for you.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {models.map(
        (model) => {
          const type =
            MODEL_TYPE_LABELS[
              model.modelType as ModelType
            ] ?? "Custom";

          return (
            <Link
              key={model.id}
              href={`/models/${model.id}`}
              className="group rounded-2xl border bg-background p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Badge
                    variant="secondary"
                  >
                    {type}
                  </Badge>

                  <h2 className="mt-3 truncate text-lg font-semibold">
                    {model.name}
                  </h2>

                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {model.description ??
                      "Performance tracker"}
                  </p>
                </div>

                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <Stat
                  icon={
                    <Database className="size-3.5" />
                  }
                  value={
                    model._count
                      ?.inputs ?? 0
                  }
                  label="Measures"
                />

                <Stat
                  icon={
                    <BarChart3 className="size-3.5" />
                  }
                  value={
                    model._count
                      ?.metrics ?? 0
                  }
                  label="Results"
                />

                <Stat
                  icon={
                    <Layers3 className="size-3.5" />
                  }
                  value={
                    model._count
                      ?.items ?? 0
                  }
                  label={
                    model.itemLabelPlural
                  }
                />
              </div>
            </Link>
          );
        },
      )}
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

        <span className="truncate text-xs">
          {label}
        </span>
      </div>

      <div className="mt-1 text-sm font-semibold">
        {value}
      </div>
    </div>
  );
}