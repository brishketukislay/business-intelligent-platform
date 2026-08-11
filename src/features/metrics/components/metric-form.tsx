"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createMetricAction,
  getMetricFormulaContextAction,
} from "../actions/metric-actions";

import {
  METRIC_TYPES,
  type MetricDefinitionInput,
} from "../schemas/metric-schema";

import {
  validateFormula,
} from "@/lib/formula-validation";

import {
  generateUniqueKey,
} from "@/lib/key-utils";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormulaReference = {
  id: string;
  name: string;
  key: string;
  type: string;
};

export function MetricForm({
  modelId,
}: {
  modelId: string;
}) {
  const [
    name,
    setName,
  ] = useState("");

  const [
    formula,
    setFormula,
  ] = useState("");

  const [
    type,
    setType,
  ] = useState<
    MetricDefinitionInput["type"]
  >("Number");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState<string | null>(
    null
  );

  const [
    references,
    setReferences,
  ] = useState<
    FormulaReference[]
  >([]);

  const [
    contextLoading,
    setContextLoading,
  ] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadContext() {
      setContextLoading(true);

      const result =
        await getMetricFormulaContextAction(
          modelId
        );

      if (
        cancelled ||
        !result.success ||
        !result.data
      ) {
        setContextLoading(false);
        return;
      }

      setReferences([
        ...result.data.inputs,
        ...result.data.metrics,
      ]);

      setContextLoading(false);
    }

    void loadContext();

    return () => {
      cancelled = true;
    };
  }, [modelId]);

  const generatedKey =
    generateUniqueKey(
      name || "metric",
      references.map(
        (reference) =>
          reference.key
      )
    );

  const formulaKeys = useMemo(
    () =>
      references.map(
        (reference) =>
          reference.key
      ),
    [references]
  );

  const validation =
    formula.trim()
      ? validateFormula(
          formula,
          formulaKeys,
          generatedKey
        )
      : {
          valid: false,
          error: null,
          references: [],
        };

  function insertKey(
    key: string
  ) {
    setFormula(
      (current) => {
        const trimmed =
          current.trimEnd();

        if (!trimmed) {
          return key;
        }

        const last =
          trimmed[trimmed.length - 1];

        const needsSpace =
          /[a-zA-Z0-9_)]/.test(
            last
          );

        return (
          trimmed +
          (needsSpace
            ? " "
            : "") +
          key
        );
      }
    );
  }

  function insertFunction() {
    setFormula(
      (current) =>
        `${current}${
          current.trim()
            ? " "
            : ""
        }CUMULATIVE()`
    );
  }

  async function submit(
    formData: FormData
  ) {
    setIsSubmitting(true);
    setMessage(null);

    formData.set(
      "modelId",
      modelId
    );

    formData.set(
      "type",
      type
    );

    formData.set(
      "key",
      generatedKey
    );

    formData.set(
      "formula",
      formula
    );

    if (!validation.valid) {
      setMessage(
        validation.error ??
          "Please enter a valid formula."
      );

      setIsSubmitting(false);
      return;
    }

    try {
      const result =
        await createMetricAction(
          formData
        );

      if (result.success) {
        setMessage(
          `Metric created. Key: ${result.key}`
        );

        window.location.reload();

        return;
      }

      setMessage(
        typeof result.error ===
          "string"
          ? result.error
          : "Unable to create metric definition."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to create metric definition. Please check the formula and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      action={submit}
      className="space-y-5"
    >
      <input
        type="hidden"
        name="modelId"
        value={modelId}
      />

      <div className="space-y-2">
        <Label htmlFor="metric-name">
          Name
        </Label>

        <Input
          id="metric-name"
          name="name"
          placeholder="Revenue"
          value={name}
          onChange={(event) =>
            setName(
              event.target.value
            )
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          System key
        </Label>

        <Input
          value={
            name
              ? generatedKey
              : "Start typing a name..."
          }
          readOnly
          tabIndex={-1}
          className="bg-muted/40 font-mono text-sm"
        />

        <p className="text-xs text-muted-foreground">
          Generated automatically. You can use
          the suggested key in formulas without
          having to manually create it.
        </p>
      </div>

      <div className="space-y-2">
        <Label>
          Type
        </Label>

        <Select
          value={type}
          onValueChange={(value) => {
            if (value) {
              setType(
                value as MetricDefinitionInput["type"]
              );
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {METRIC_TYPES.map(
              (metricType) => (
                <SelectItem
                  key={metricType}
                  value={metricType}
                >
                  {metricType}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        <input
          type="hidden"
          name="type"
          value={type}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="metric-unit">
          Unit
        </Label>

        <Input
          id="metric-unit"
          name="unit"
          placeholder="GBP"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="metric-category">
          Category
        </Label>

        <Input
          id="metric-category"
          name="category"
          placeholder="Financial"
        />
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="metric-formula">
            Formula
          </Label>

          <p className="mt-1 text-xs text-muted-foreground">
            Use the buttons below to insert model
            inputs and metrics. You don't need to
            remember their keys.
          </p>
        </div>

        <Input
          id="metric-formula"
          name="formula"
          value={formula}
          onChange={(event) =>
            setFormula(
              event.target.value
            )
          }
          placeholder="revenue - cost_of_sales"
          required
          className={
            formula &&
            !validation.valid
              ? "border-destructive"
              : ""
          }
        />

        {formula && (
          <div
            className={
              validation.valid
                ? "rounded-md border border-green-500/30 bg-green-500/5 px-3 py-2 text-sm text-green-700 dark:text-green-400"
                : "rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            }
          >
            {validation.valid
              ? "✓ Formula looks valid."
              : `⚠ ${
                  validation.error ??
                  "Invalid formula."
                }`}
          </div>
        )}

        <div className="rounded-md border bg-muted/20 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium">
              Suggested references
            </p>

            {contextLoading && (
              <span className="text-xs text-muted-foreground">
                Loading...
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {references.map(
              (reference) => (
                <button
                  key={reference.id}
                  type="button"
                  onClick={() =>
                    insertKey(
                      reference.key
                    )
                  }
                  className="rounded-md border bg-background px-2 py-1 text-xs transition-colors hover:bg-muted"
                  title={`Insert ${reference.key}`}
                >
                  <span className="font-medium">
                    {reference.name}
                  </span>

                  <span className="ml-1 font-mono text-muted-foreground">
                    {reference.key}
                  </span>
                </button>
              )
            )}

            <button
              type="button"
              onClick={
                insertFunction
              }
              className="rounded-md border border-dashed bg-background px-2 py-1 text-xs transition-colors hover:bg-muted"
              title="Insert CUMULATIVE()"
            >
              CUMULATIVE()
            </button>
          </div>

          {!contextLoading &&
            references.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                No active inputs or metrics are
                available yet.
              </p>
            )}
        </div>

        <p className="text-xs text-muted-foreground">
          Example:
          {" "}
          <code>
            revenue - cost_of_sales
          </code>
          {" "}
          or
          {" "}
          <code>
            CUMULATIVE(revenue)
          </code>
        </p>
      </div>

      <Button
        type="submit"
        disabled={
          isSubmitting ||
          !name.trim() ||
          !formula.trim() ||
          !validation.valid
        }
      >
        {isSubmitting
          ? "Creating..."
          : "Create Metric"}
      </Button>

      {message && (
        <p className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </form>
  );
}