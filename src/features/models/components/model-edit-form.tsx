"use client";

import { useMemo, useState } from "react";
import type { BusinessModel } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { createTrackerAction } from "../actions/tracker-setup-actions";
import { getTrackerTemplate } from "../services/tracker-template-service";
import {
  MODEL_TYPES,
  MODEL_TYPE_DESCRIPTIONS,
  MODEL_TYPE_LABELS,
  PERIOD_TYPE_LABELS,
  type ModelType,
  type PeriodType,
} from "../types";

type CustomInput = {
  name: string;
  type: "Number" | "Currency" | "Percentage" | "Text";
  scope: "MODEL" | "PERIOD" | "ITEM" | "ITEM_PERIOD";
  unit: string;
  category: string;
};

type ModelFormProps = {
  /**
   * When supplied, the form is being rendered for an existing model.
   *
   * The current tracker setup action only supports creation, so edit mode
   * currently uses the existing model as context but does not create a
   * duplicate.
   */
  model?: BusinessModel;
};

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

function emptyCustomInput(): CustomInput {
  return {
    name: "",
    type: "Number",
    scope: "PERIOD",
    unit: "",
    category: "",
  };
}

function getInitialModelType(
  model?: BusinessModel,
): ModelType {
  if (!model) {
    return "COMPANY";
  }

  return MODEL_TYPES.includes(
    model.modelType as ModelType,
  )
    ? (model.modelType as ModelType)
    : "CUSTOM";
}

export function ModelForm({
  model,
}: ModelFormProps) {
  const router = useRouter();

  const isEditing = Boolean(model);

  const initialModelType =
    getInitialModelType(model);

  const initialTemplate =
    getTrackerTemplate(initialModelType);

  const [open, setOpen] = useState(false);

  const [step, setStep] = useState(1);

  const [modelType, setModelType] =
    useState<ModelType>(
      initialModelType,
    );

  const [name, setName] =
    useState(
      model?.name ?? "",
    );

  const [description, setDescription] =
    useState(
      model?.description ?? "",
    );

  const [periodType, setPeriodType] =
    useState<PeriodType>(
      initialTemplate.recommendedPeriodType,
    );

  const [fiscalYearStartMonth, setFiscalYearStartMonth] =
    useState(1);

  const [currency, setCurrency] =
    useState("GBP");

  const [selectedInputs, setSelectedInputs] =
    useState<string[]>(
      initialTemplate.inputs
        .filter(
          (input) =>
            input.recommended !== false,
        )
        .map(
          (input) =>
            input.key,
        ),
    );

  const [selectedMetrics, setSelectedMetrics] =
    useState<string[]>(
      initialTemplate.metrics
        .filter(
          (metric) =>
            metric.recommended !== false,
        )
        .map(
          (metric) =>
            metric.key,
        ),
    );

  const [customInputs, setCustomInputs] =
    useState<CustomInput[]>([]);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const template = useMemo(
    () =>
      getTrackerTemplate(
        modelType,
      ),
    [modelType],
  );

  function resetForType(
    type: ModelType,
  ) {
    const nextTemplate =
      getTrackerTemplate(type);

    setModelType(type);

    setSelectedInputs(
      nextTemplate.inputs
        .filter(
          (input) =>
            input.recommended !== false,
        )
        .map(
          (input) =>
            input.key,
        ),
    );

    setSelectedMetrics(
      nextTemplate.metrics
        .filter(
          (metric) =>
            metric.recommended !== false,
        )
        .map(
          (metric) =>
            metric.key,
        ),
    );

    setCustomInputs([]);

    setPeriodType(
      nextTemplate.recommendedPeriodType,
    );
  }

  function openWizard() {
    if (isEditing && model) {
      const type =
        getInitialModelType(model);

      const nextTemplate =
        getTrackerTemplate(type);

      setModelType(type);

      setName(model.name);

      setDescription(
        model.description ?? "",
      );

      setSelectedInputs(
        nextTemplate.inputs
          .filter(
            (input) =>
              input.recommended !== false,
          )
          .map(
            (input) =>
              input.key,
          ),
      );

      setSelectedMetrics(
        nextTemplate.metrics
          .filter(
            (metric) =>
              metric.recommended !== false,
          )
          .map(
            (metric) =>
              metric.key,
          ),
      );

      setPeriodType(
        nextTemplate.recommendedPeriodType,
      );
    } else {
      resetForType("COMPANY");

      setName("");

      setDescription("");

      setFiscalYearStartMonth(1);

      setCurrency("GBP");
    }

    setStep(1);

    setError(null);

    setOpen(true);
  }

  function toggleInput(
    key: string,
  ) {
    const isSelected =
      selectedInputs.includes(key);

    setSelectedInputs(
      (current) =>
        isSelected
          ? current.filter(
              (item) =>
                item !== key,
            )
          : [
              ...current,
              key,
            ],
    );

    if (isSelected) {
      const affectedMetrics =
        template.metrics
          .filter(
            (metric) =>
              metric.requires.includes(
                key,
              ),
          )
          .map(
            (metric) =>
              metric.key,
          );

      setSelectedMetrics(
        (current) =>
          current.filter(
            (metricKey) =>
              !affectedMetrics.includes(
                metricKey,
              ),
          ),
      );
    }
  }

  function toggleMetric(
    key: string,
  ) {
    const metric =
      template.metrics.find(
        (item) =>
          item.key === key,
      );

    if (!metric) {
      return;
    }

    const available =
      metric.requires.every(
        (requiredKey) =>
          selectedInputs.includes(
            requiredKey,
          ),
      );

    if (!available) {
      return;
    }

    setSelectedMetrics(
      (current) =>
        current.includes(key)
          ? current.filter(
              (item) =>
                item !== key,
            )
          : [
              ...current,
              key,
            ],
    );
  }

  function addCustomInput() {
    setCustomInputs(
      (current) => [
        ...current,
        emptyCustomInput(),
      ],
    );
  }

  function updateCustomInput(
    index: number,
    patch: Partial<CustomInput>,
  ) {
    setCustomInputs(
      (current) =>
        current.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  ...patch,
                }
              : item,
        ),
    );
  }

  function removeCustomInput(
    index: number,
  ) {
    setCustomInputs(
      (current) =>
        current.filter(
          (_, itemIndex) =>
            itemIndex !== index,
        ),
    );
  }

  async function submit() {
    if (!name.trim()) {
      setError(
        "Please give the tracker a name.",
      );
      return;
    }

    if (isEditing) {
      setError(
        "Editing an existing tracker is not available yet. Please close this window and use the tracker settings.",
      );
      return;
    }

    setSaving(true);

    setError(null);

    try {
      const result =
        await createTrackerAction({
          name: name.trim(),
          description:
            description.trim(),
          modelType,
          periodType,
          fiscalYearStartMonth,
          currency,
          inputKeys:
            selectedInputs,
          metricKeys:
            selectedMetrics,
          customInputs:
            customInputs.filter(
              (input) =>
                input.name.trim(),
            ),
        });

      if (!result.success) {
        setError(
          result.error ??
            "Unable to create tracker.",
        );

        return;
      }

      setOpen(false);

      router.push(
        `/models/${result.modelId}`,
      );

      router.refresh();
    } catch (submitError) {
      console.error(
        "Failed to create tracker:",
        submitError,
      );

      setError(
        "Something went wrong while creating the tracker. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  const canContinue =
    step !== 2 ||
    name.trim().length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            onClick={openWizard}
          />
        }
      >
        <Plus className="mr-2 size-4" />

        {isEditing
          ? "Configure tracker"
          : "New tracker"}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>
            {isEditing
              ? "Tracker configuration"
              : "Create a tracker"}
          </DialogTitle>

          <DialogDescription>
            Configure what you want to track.
            The technical setup happens
            automatically.
          </DialogDescription>

          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4].map(
              (number) => (
                <div
                  key={number}
                  className={`h-1.5 flex-1 rounded-full ${
                    number <= step
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              ),
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto px-6 py-6">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">
                  What do you want to track?
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Start with the closest match.
                  You can customise the measures
                  afterwards.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {MODEL_TYPES.map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      disabled={isEditing}
                      onClick={() =>
                        resetForType(type)
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        modelType ===
                        type
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:bg-muted/50"
                      } ${
                        isEditing
                          ? "cursor-default"
                          : ""
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

              {isEditing && (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                  The tracker type cannot be
                  changed after creation.
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">
                  Give your tracker a name
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Use something that will make
                  sense to everyone using it.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracker-name">
                  Name
                </Label>

                <Input
                  id="tracker-name"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  placeholder={
                    modelType ===
                    "PROJECT"
                      ? "Website redesign"
                      : modelType ===
                          "INDIVIDUAL"
                        ? "Jane Smith"
                        : modelType ===
                            "COMPANY"
                          ? "Company performance"
                          : "Performance tracker"
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tracker-description">
                  Description
                </Label>

                <Textarea
                  id="tracker-description"
                  value={
                    description
                  }
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  placeholder={
                    template.description
                  }
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>
                    Update frequency
                  </Label>

                  <select
                    value={
                      periodType
                    }
                    onChange={(event) =>
                      setPeriodType(
                        event.target
                          .value as PeriodType,
                      )
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    {Object.entries(
                      PERIOD_TYPE_LABELS,
                    ).map(
                      ([
                        value,
                        label,
                      ]) => (
                        <option
                          key={value}
                          value={value}
                        >
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Currency
                  </Label>

                  <select
                    value={
                      currency
                    }
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
                </div>

                <div className="space-y-2">
                  <Label>
                    Financial year
                  </Label>

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
                          value={
                            index + 1
                          }
                        >
                          {month}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">
                  What numbers should you record?
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  We have selected sensible
                  defaults for{" "}
                  {template.name.toLowerCase()}.
                  Remove anything you do not
                  need.
                </p>
              </div>

              {template.inputs.length >
                0 && (
                <div className="space-y-2">
                  {template.inputs.map(
                    (input) => {
                      const selected =
                        selectedInputs.includes(
                          input.key,
                        );

                      return (
                        <button
                          key={input.key}
                          type="button"
                          onClick={() =>
                            toggleInput(
                              input.key,
                            )
                          }
                          className={`flex w-full items-start justify-between gap-4 rounded-xl border p-4 text-left transition ${
                            selected
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div>
                            <div className="font-medium">
                              {input.name}
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {
                                input.description
                              }
                            </p>

                            <div className="mt-2 text-xs text-muted-foreground">
                              {input.scope ===
                                "MODEL" &&
                                "One value for the whole tracker"}

                              {input.scope ===
                                "PERIOD" &&
                                "Updated each period"}

                              {input.scope ===
                                "ITEM" &&
                                `One value per ${template.itemLabelSingular.toLowerCase()}`}

                              {input.scope ===
                                "ITEM_PERIOD" &&
                                `Updated per ${template.itemLabelSingular.toLowerCase()} and period`}
                            </div>
                          </div>

                          {selected && (
                            <Check className="mt-1 size-4 shrink-0 text-primary" />
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              )}

              {template.inputs.length ===
                0 && (
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <p className="font-medium">
                    No predefined measures
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Add your own measures below.
                  </p>
                </div>
              )}

              {modelType ===
                "CUSTOM" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        Custom measures
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        Add your own measures without
                        dealing with system keys.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={
                        addCustomInput
                      }
                    >
                      <Plus className="mr-2 size-4" />
                      Add measure
                    </Button>
                  </div>

                  {customInputs.map(
                    (
                      input,
                      index,
                    ) => (
                      <div
                        key={index}
                        className="rounded-xl border p-4"
                      >
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            placeholder="Measure name"
                            value={
                              input.name
                            }
                            onChange={(
                              event,
                            ) =>
                              updateCustomInput(
                                index,
                                {
                                  name: event
                                    .target
                                    .value,
                                },
                              )
                            }
                          />

                          <select
                            value={
                              input.type
                            }
                            onChange={(
                              event,
                            ) =>
                              updateCustomInput(
                                index,
                                {
                                  type: event
                                    .target
                                    .value as CustomInput["type"],
                                },
                              )
                            }
                            className="h-10 rounded-md border bg-background px-3 text-sm"
                          >
                            <option value="Number">
                              Number
                            </option>

                            <option value="Currency">
                              Currency
                            </option>

                            <option value="Percentage">
                              Percentage
                            </option>

                            <option value="Text">
                              Text
                            </option>
                          </select>

                          <select
                            value={
                              input.scope
                            }
                            onChange={(
                              event,
                            ) =>
                              updateCustomInput(
                                index,
                                {
                                  scope: event
                                    .target
                                    .value as CustomInput["scope"],
                                },
                              )
                            }
                            className="h-10 rounded-md border bg-background px-3 text-sm"
                          >
                            <option value="MODEL">
                              Whole tracker
                            </option>

                            <option value="PERIOD">
                              Each period
                            </option>

                            <option value="ITEM">
                              Each item
                            </option>

                            <option value="ITEM_PERIOD">
                              Each item + period
                            </option>
                          </select>

                          <Input
                            placeholder="Category (optional)"
                            value={
                              input.category
                            }
                            onChange={(
                              event,
                            ) =>
                              updateCustomInput(
                                index,
                                {
                                  category:
                                    event
                                      .target
                                      .value,
                                },
                              )
                            }
                          />
                        </div>

                        <div className="mt-3 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeCustomInput(
                                index,
                              )
                            }
                          >
                            <Trash2 className="mr-2 size-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">
                  What should be calculated automatically?
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  These results are calculated
                  from the measures you selected.
                </p>
              </div>

              {template.metrics.length ===
                0 && (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <p className="font-medium">
                    No predefined calculations
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    You can add calculations after
                    creating the tracker.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {template.metrics.map(
                  (metric) => {
                    const selected =
                      selectedMetrics.includes(
                        metric.key,
                      );

                    const available =
                      metric.requires.every(
                        (key) =>
                          selectedInputs.includes(
                            key,
                          ),
                      );

                    return (
                      <button
                        key={metric.key}
                        type="button"
                        disabled={
                          !available
                        }
                        onClick={() =>
                          toggleMetric(
                            metric.key,
                          )
                        }
                        className={`flex w-full items-start justify-between gap-4 rounded-xl border p-4 text-left ${
                          !available
                            ? "cursor-not-allowed opacity-50"
                            : selected
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                        }`}
                      >
                        <div>
                          <div className="font-medium">
                            {metric.name}
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {
                              metric.description
                            }
                          </p>

                          {!available && (
                            <p className="mt-2 text-xs text-amber-600">
                              Select the required
                              measures first.
                            </p>
                          )}
                        </div>

                        {selected && (
                          <Check className="mt-1 size-4 shrink-0 text-primary" />
                        )}
                      </button>
                    );
                  },
                )}
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
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
                !canContinue
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
              onClick={() =>
                void submit()
              }
            >
              {saving
                ? "Creating..."
                : isEditing
                  ? "Save changes"
                  : "Create tracker"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}