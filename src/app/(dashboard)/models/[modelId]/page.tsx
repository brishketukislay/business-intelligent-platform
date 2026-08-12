import Link from "next/link";
import {
  notFound,
} from "next/navigation";

import {
  ArrowRight,
  BarChart3,
  Settings2,
  Table2,
} from "lucide-react";

import {
  getBusinessModelById,
} from "@/features/models/services/model-service";

import {
  getInputDefinitions,
  getInputPeriodData,
} from "@/features/inputs/services/input-service";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  MODEL_TYPE_LABELS,
} from "@/features/models/types";

type Props = {
  params: Promise<{
    modelId: string;
  }>;
};

export default async function ModelDetailPage({
  params,
}: Props) {
  const { modelId } =
    await params;

  const user =
    await requireCurrentUser();

  const model =
    await getBusinessModelById(
      modelId,
      user.id,
    );

  if (!model) {
    notFound();
  }

  const [
    inputs,
    periodData,
  ] = await Promise.all([
    getInputDefinitions(
      modelId,
      user.id,
    ),
    getInputPeriodData(
      modelId,
      user.id,
    ),
  ]);

  const enteredValues =
    periodData.values.filter(
      (item) =>
        item.value.trim() !== "",
    ).length;

  const totalCells =
    inputs.filter(
      (input) =>
        input.scope === "PERIOD",
    ).length *
    periodData.periods.length;

  const completion =
    totalCells === 0
      ? 0
      : Math.round(
          (enteredValues /
            totalCells) *
            100,
        );

  const type =
    MODEL_TYPE_LABELS[
      model.modelType as keyof typeof MODEL_TYPE_LABELS
    ] ?? "Custom";

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm font-medium text-primary">
            {type} tracker
          </div>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {model.name}
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {model.description}
          </p>
        </div>

        <Link
          href={`/models/${model.id}/edit`}
          className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
        >
          <Settings2 className="mr-2 size-4" />
          Configure
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Data entered"
          value={`${completion}%`}
          description={`${enteredValues} of ${totalCells} values`}
        />

        <SummaryCard
          title="Measures"
          value={String(inputs.length)}
          description="Inputs available to track"
        />

        <SummaryCard
          title="Periods"
          value={String(
            periodData.periods.length,
          )}
          description="Reporting periods"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActionCard
          href={`/models/${model.id}/inputs`}
          icon={
            <Table2 className="size-5" />
          }
          title="Enter performance data"
          description="Update your monthly, quarterly or annual figures."
          primary
        />

        <ActionCard
          href={`/models/${model.id}/metrics`}
          icon={
            <BarChart3 className="size-5" />
          }
          title="View calculated results"
          description="Review calculated KPIs and performance measures."
        />
      </div>

      <div className="rounded-2xl border bg-muted/20 p-6">
        <h2 className="font-semibold">
          Advanced options
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          These are optional tools for users who need
          more control over the tracker.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/models/${model.id}/inputs`}
            className="rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted"
          >
            Manage measures
          </Link>

          <Link
            href={`/models/${model.id}/metrics`}
            className="rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted"
          >
            Manage calculations
          </Link>

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
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-5">
      <div className="text-sm text-muted-foreground">
        {title}
      </div>

      <div className="mt-2 text-3xl font-semibold">
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