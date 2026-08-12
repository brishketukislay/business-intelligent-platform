"use client";

import {
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  createTrackerAction,
} from "../actions/model-setup-actions";

import type {
  ModelType,
  PeriodType,
} from "../types";

import {
  MODEL_TYPE_LABELS,
} from "../types";

import {
  getPeriodOptions,
  getTrackerTemplate,
} from "../services/tracker-template-service";

const MODEL_TYPE_DESCRIPTIONS: Record<
  ModelType,
  string
> = {
  COMPANY:
    "Overall business performance, profitability and growth.",
  PROJECT:
    "Project delivery, budget, effort and financial performance.",
  INDIVIDUAL:
    "Individual contribution, utilisation and output.",
  SALES:
    "Sales activity, pipeline and revenue.",
  CUSTOMER:
    "Customer growth, retention and commercial performance.",
  OPERATIONS:
    "Operational volume, quality, cost and efficiency.",
  CUSTOM:
    "Start with a blank tracker and define your own measures.",
};

const MODEL_TYPES: ModelType[] = [
  "COMPANY",
  "PROJECT",
  "INDIVIDUAL",
  "SALES",
  "CUSTOMER",
  "OPERATIONS",
  "CUSTOM",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function ModelCreateWizard() {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const [step, setStep] =
    useState(1);

  const [modelType, setModelType] =
    useState<ModelType>("COMPANY");

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [periodType, setPeriodType] =
    useState<PeriodType>("MONTH");

  const [fiscalYearStartMonth, setFiscalYearStartMonth] =
    useState(1);

  const [currency, setCurrency] =
    useState("GBP");

  const template =
    useMemo(
      () => getTrackerTemplate(modelType),
      [modelType],
    );

  const [inputKeys, setInputKeys] =
    useState<string[]>(
      template.inputs.map(
        (input) => input.key,
      ),
    );

  const [metricKeys, setMetricKeys] =
    useState<string[]>(
      template.metrics.map(
        (metric) => metric.key,
      ),
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  function chooseType(
    type: ModelType,
  ) {
    const next =
      getTrackerTemplate(type);

    setModelType(type);
    setInputKeys(
      next.inputs.map(
        (input) => input.key,
      ),
    );
    setMetricKeys(
      next.metrics.map(
        (metric) => metric.key,
      ),
    );
  }

  function toggle(
    values: string[],
    value: string,
    setter: (
      value: string[],
    ) => void,
  ) {
    setter(
      values.includes(value)
        ? values.filter(
            (item) =>
              item !== value,
          )
        : [...values, value],
    );
  }

  async function submit() {
    setSaving(true);
    setError(null);

    const result =
      await createTrackerAction({
        name,
        description,
        modelType,
        periodType,
        fiscalYearStartMonth,
        currency,
        inputKeys,
        metricKeys,
      });

    if (!result.success) {
      setError(
        result.error ??
          "Unable to create tracker.",
      );
      setSaving(false);
      return;
    }

    setOpen(false);
    router.push(
      `/models/${result.modelId}`,
    );
    router.refresh();
  }

  if (!open) {
    return (
      <Button
        onClick={() => {
          setOpen(true);
          setStep(1);
        }}
      >
        <Plus className="mr-2 size-4" />
        New tracker
      </Button>
    );
  }

  return (
    <div
  className="
    fixed
    inset-0
    z-50
    flex
    items-center
    justify-center
    bg-black/50
    p-4
  "
>
      <div
  className="
    mx-auto
    flex
    max-h-[calc(100vh-2rem)]
    w-full
    max-w-3xl
    flex-col
    overflow-hidden
    rounded-2xl
    border
    border-slate-200
    bg-white
    text-slate-950
    shadow-2xl
  "
>
        <div className="border-b px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Create a tracker
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Set it up once. Your team can then
                update the numbers without touching
                the configuration.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground"
            >
              ✕
            </button>
          </div>

          <div className="mt-5 flex gap-2">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className={`h-1.5 flex-1 rounded-full ${
                    item <= step
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              ),
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold">
                What are you tracking?
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Pick the closest match. You can
                customise everything afterwards.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {MODEL_TYPES.map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        chooseType(type)
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        modelType === type
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {
                            MODEL_TYPE_LABELS[
                              type
                            ]
                          }
                        </span>

                        {modelType ===
                          type && (
                          <Check className="size-4 text-primary" />
                        )}
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {
                          MODEL_TYPE_DESCRIPTIONS[
                            type
                          ]
                        }
                      </p>
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">
                  Give it a name
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use a name your team will recognise.
                </p>
              </div>

              <Input
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder={
                  modelType === "PROJECT"
                    ? "e.g. Website Redesign"
                    : modelType === "INDIVIDUAL"
                      ? "e.g. Jane Smith"
                      : "e.g. Acme Ltd Performance"
                }
              />

              <Textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                placeholder="Optional description"
                rows={4}
              />

              <div>
                <h4 className="font-medium">
                  Update frequency
                </h4>

                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {getPeriodOptions().map(
                    (option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setPeriodType(
                            option.value,
                          )
                        }
                        className={`rounded-lg border px-4 py-3 text-sm ${
                          periodType ===
                          option.value
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                      >
                        {option.label}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Currency
                  </span>
                  <select
                    value={currency}
                    onChange={(event) =>
                      setCurrency(
                        event.target.value,
                      )
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="GBP">
                      GBP (£)
                    </option>
                    <option value="EUR">
                      EUR (€)
                    </option>
                    <option value="USD">
                      USD ($)
                    </option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    Financial year starts
                  </span>
                  <select
                    value={
                      fiscalYearStartMonth
                    }
                    onChange={(event) =>
                      setFiscalYearStartMonth(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    {months.map(
                      (
                        month,
                        index,
                      ) => (
                        <option
                          key={month}
                          value={index + 1}
                        >
                          {month}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold">
                What should you track?
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                We have selected a sensible starting
                point. Remove anything you don't need.
              </p>

              <div className="mt-5 space-y-2">
                {template.inputs.map(
                  (input) => {
                    const selected =
                      inputKeys.includes(
                        input.key,
                      );

                    return (
                      <button
                        key={input.key}
                        type="button"
                        onClick={() =>
                          toggle(
                            inputKeys,
                            input.key,
                            setInputKeys,
                          )
                        }
                        className={`flex w-full items-center justify-between rounded-lg border p-4 text-left ${
                          selected
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                      >
                        <div>
                          <div className="font-medium">
                            {input.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {input.category ??
                              input.type}
                            {input.unit
                              ? ` · ${input.unit}`
                              : ""}
                          </div>
                        </div>

                        {selected && (
                          <Check className="size-4 text-primary" />
                        )}
                      </button>
                    );
                  },
                )}

                {template.inputs.length === 0 && (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Custom trackers start empty.
                    You can add measures after creation.
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="text-lg font-semibold">
                Automatic calculations
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                These are calculated from the inputs you
                selected.
              </p>

              <div className="mt-5 space-y-2">
                {template.metrics.map(
                  (metric) => {
                    const selected =
                      metricKeys.includes(
                        metric.key,
                      );

                    return (
                      <button
                        key={metric.key}
                        type="button"
                        onClick={() =>
                          toggle(
                            metricKeys,
                            metric.key,
                            setMetricKeys,
                          )
                        }
                        className={`w-full rounded-lg border p-4 text-left ${
                          selected
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {metric.name}
                          </span>

                          {selected && (
                            <Check className="size-4 text-primary" />
                          )}
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {metric.category}
                        </p>
                      </button>
                    );
                  },
                )}

                {template.metrics.length === 0 && (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    You can add calculated metrics later.
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (step === 1) {
                setOpen(false);
              } else {
                setStep(
                  step - 1,
                );
              }
            }}
          >
            <ChevronLeft className="mr-2 size-4" />
            {step === 1
              ? "Cancel"
              : "Back"}
          </Button>

          {step < 4 ? (
            <Button
              type="button"
              disabled={
                step === 2 &&
                !name.trim()
              }
              onClick={() =>
                setStep(
                  step + 1,
                )
              }
            >
              Continue
              <ChevronRight className="ml-2 size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={
                saving ||
                !name.trim()
              }
              onClick={submit}
            >
              {saving
                ? "Creating..."
                : "Create tracker"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}