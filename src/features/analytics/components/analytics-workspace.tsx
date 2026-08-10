"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

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
  Badge,
} from "@/components/ui/badge";

import {
  Plus,
  Trash2,
  Pencil,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ScatterChart as ScatterChartIcon,
  Palette,
} from "lucide-react";

import {
  saveAnalyticsChartAction,
  updateAnalyticsChartAction,
  deleteAnalyticsChartAction,
} from "../actions/analytics-actions";

import {
  AnalyticsChart,
} from "./analytics-chart";

import type {
  AnalyticsChartConfig,
  AnalyticsChartRecord,
  AnalyticsDashboardData,
  AnalyticsModelData,
  AnalyticsSeriesConfig,
} from "../types";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#9333ea",
  "#0891b2",
  "#dc2626",
  "#ca8a04",
  "#db2777",
];

const CHART_DEFAULTS: AnalyticsChartConfig = {
  title:
    "New analytics",
  chartType:
    "line",
  displayMode:
    "periods",
  series: [],
  showLegend:
    true,
  showGrid:
    true,
  showValues:
    false,
};

type Props =
  AnalyticsDashboardData;

function makeSeries(
  sourceKey: string,
  index: number
): AnalyticsSeriesConfig {
  return {
    id:
      `${Date.now()}-${index}`,
    sourceKey,
    scenarioId:
      "base",
    label:
      "",
    color:
      COLORS[
        index %
          COLORS.length
      ],
  };
}

function getSourceLabel(
  modelData: AnalyticsModelData,
  sourceKey: string
) {
  return (
    modelData.sources.find(
      source =>
        source.sourceKey ===
        sourceKey
    )?.name ??
    "Unknown source"
  );
}

function getScenarioLabel(
  modelData: AnalyticsModelData,
  scenarioId: string
) {
  if (
    scenarioId ===
    "base"
  ) {
    return "Base model";
  }

  return (
    modelData.scenarios.find(
      scenario =>
        scenario.id ===
        scenarioId
    )?.name ??
    "Unknown scenario"
  );
}

function emptyConfigForModel(
  modelData: AnalyticsModelData
): AnalyticsChartConfig {
  const firstSource =
    modelData.sources[0];

  return {
    ...CHART_DEFAULTS,
    title:
      firstSource
        ? `${firstSource.name} over time`
        : "New analytics",
    series:
      firstSource
        ? [
            makeSeries(
              firstSource.sourceKey,
              0
            ),
          ]
        : [],
  };
}

function ChartTypeIcon({
  type,
}: {
  type: AnalyticsChartConfig["chartType"];
}) {
  if (type === "line") {
    return (
      <LineChartIcon className="size-4" />
    );
  }

  if (type === "bar") {
    return (
      <BarChart3 className="size-4" />
    );
  }

  if (type === "pie") {
    return (
      <PieChartIcon className="size-4" />
    );
  }

  return (
    <ScatterChartIcon className="size-4" />
  );
}

export default function AnalyticsWorkspace({
  models,
  charts,
}: Props) {
  const router =
    useRouter();

  const initialModelId =
    models[0]?.model.id ??
    "";

  const [
    selectedModelId,
    setSelectedModelId,
  ] = useState(
    initialModelId
  );

  const [
    editingChartId,
    setEditingChartId,
  ] = useState<
    string | null
  >(null);

  const selectedModel =
    models.find(
      model =>
        model.model.id ===
        selectedModelId
    ) ?? models[0];

  const [
    config,
    setConfig,
  ] =
    useState<AnalyticsChartConfig>(
      () =>
        selectedModel
          ? emptyConfigForModel(
              selectedModel
            )
          : CHART_DEFAULTS
    );

  const [
    chartName,
    setChartName,
  ] = useState(
    config.title
  );

  const [
    isBuilderOpen,
    setIsBuilderOpen,
  ] = useState(false);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const modelCharts =
    useMemo(
      () =>
        charts.filter(
          chart =>
            chart.modelId ===
            selectedModel?.model.id
        ),
      [
        charts,
        selectedModel,
      ]
    );

  function resetBuilder(
    model: AnalyticsModelData
  ) {
    const next =
      emptyConfigForModel(
        model
      );

    setEditingChartId(
      null
    );

    setConfig(next);
    setChartName(
      next.title
    );
    setError(null);
    setIsBuilderOpen(
      true
    );
  }

  function openEdit(
    chart: AnalyticsChartRecord
  ) {
    const model =
      models.find(
        item =>
          item.model.id ===
          chart.modelId
      );

    if (!model) {
      return;
    }

    setSelectedModelId(
      chart.modelId
    );

    setEditingChartId(
      chart.id
    );

    setConfig(
      chart.config
    );

    setChartName(
      chart.name
    );

    setError(null);
    setIsBuilderOpen(
      true
    );
  }

  function updateConfig(
    patch: Partial<AnalyticsChartConfig>
  ) {
    setConfig(
      current => ({
        ...current,
        ...patch,
      })
    );
  }

  function updateSeries(
    id: string,
    patch: Partial<AnalyticsSeriesConfig>
  ) {
    setConfig(
      current => ({
        ...current,
        series:
          current.series.map(
            series =>
              series.id ===
              id
                ? {
                    ...series,
                    ...patch,
                  }
                : series
          ),
      })
    );
  }

  function addSeries() {
    if (!selectedModel) {
      return;
    }

    const source =
      selectedModel.sources.find(
        item =>
          !config.series.some(
            series =>
              series.sourceKey ===
              item.sourceKey
          )
      );

    if (!source) {
      return;
    }

    setConfig(
      current => ({
        ...current,
        series: [
          ...current.series,
          makeSeries(
            source.sourceKey,
            current.series.length
          ),
        ],
      })
    );
  }

  function removeSeries(
    id: string
  ) {
    setConfig(
      current => ({
        ...current,
        series:
          current.series.filter(
            series =>
              series.id !==
              id
          ),
      })
    );
  }

  async function save() {
    if (!selectedModel) {
      return;
    }

    if (
      config.series.length ===
      0
    ) {
      setError(
        "Select at least one input or metric."
      );
      return;
    }

    if (
      config.chartType ===
        "scatter" &&
      config.series.length !==
        2
    ) {
      setError(
        "Scatter charts require exactly two series."
      );
      return;
    }

    setIsSaving(
      true
    );
    setError(null);

    const payload = {
      modelId:
        selectedModel.model.id,
      name:
        chartName.trim() ||
        config.title,
      config: {
        ...config,
        title:
          config.title.trim() ||
          chartName.trim() ||
          "Analytics",
      },
    };

    try {
      const result =
        editingChartId
          ? await updateAnalyticsChartAction(
              editingChartId,
              payload
            )
          : await saveAnalyticsChartAction(
              payload
            );

      if (!result.success) {
        setError(
          result.error ??
            "Unable to save analytics."
        );
        return;
      }

      setIsBuilderOpen(
        false
      );

      setEditingChartId(
        null
      );

      router.refresh();
    } catch (saveError) {
      console.error(
        saveError
      );

      setError(
        "An unexpected error occurred while saving."
      );
    } finally {
      setIsSaving(
        false
      );
    }
  }

  async function removeChart(
    chartId: string
  ) {
    if (
      !window.confirm(
        "Delete this analytics chart?"
      )
    ) {
      return;
    }

    try {
      const result =
        await deleteAnalyticsChartAction(
          chartId
        );

      if (!result.success) {
        setError(
          result.error ??
            "Unable to delete chart."
        );
        return;
      }

      router.refresh();
    } catch (deleteError) {
      console.error(
        deleteError
      );

      setError(
        "Unable to delete chart."
      );
    }
  }

  if (models.length === 0) {
    return null;
  }

  if (!selectedModel) {
    return null;
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Analytics
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Build reusable charts from model inputs, metrics and scenarios.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={
              selectedModelId
            }
            onChange={event => {
              const nextModelId =
                event.target.value;

              const nextModel =
                models.find(
                  model =>
                    model.model.id ===
                    nextModelId
                );

              if (!nextModel) {
                return;
              }

              setSelectedModelId(
                nextModelId
              );

              const nextConfig =
                emptyConfigForModel(
                  nextModel
                );

              setEditingChartId(
                null
              );

              setConfig(
                nextConfig
              );

              setChartName(
                nextConfig.title
              );

              setIsBuilderOpen(
                false
              );
            }}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
          >
            {models.map(
              model => (
                <option
                  key={
                    model.model.id
                  }
                  value={
                    model.model.id
                  }
                >
                  {
                    model.model
                      .name
                  }
                </option>
              )
            )}
          </select>

          <Button
            type="button"
            onClick={() =>
              resetBuilder(
                selectedModel
              )
            }
          >
            <Plus />
            Add analytics
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {modelCharts.length ===
      0 ? (
        <div className="rounded-xl border border-dashed bg-background p-8 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="size-5" />
          </div>

          <h3 className="mt-4 font-semibold">
            No analytics yet
          </h3>

          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Create a chart from any numeric input or metric in this model.
            You can also compare different scenarios.
          </p>

          <Button
            className="mt-5"
            type="button"
            onClick={() =>
              resetBuilder(
                selectedModel
              )
            }
          >
            <Plus />
            Create your first chart
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {modelCharts.map(
            chart => (
              <div
                key={
                  chart.id
                }
                className="overflow-hidden rounded-xl border bg-background shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <ChartTypeIcon
                        type={
                          chart
                            .config
                            .chartType
                        }
                      />

                      <h3 className="truncate font-semibold">
                        {
                          chart.name
                        }
                      </h3>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="secondary">
                        {
                          chart
                            .config
                            .chartType
                        }
                      </Badge>

                      <Badge variant="secondary">
                        {
                          chart
                            .config
                            .series
                            .length
                        }{" "}
                        series
                      </Badge>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Edit analytics"
                      onClick={() =>
                        openEdit(
                          chart
                        )
                      }
                    >
                      <Pencil />
                    </Button>

                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Delete analytics"
                      onClick={() =>
                        removeChart(
                          chart.id
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>

                <div className="p-4">
                  <AnalyticsChart
                    modelData={
                      selectedModel
                    }
                    config={
                      chart.config
                    }
                    compact
                  />
                </div>
              </div>
            )
          )}
        </div>
      )}

      {isBuilderOpen && (
        <div className="rounded-xl border bg-background shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b px-5 py-5">
            <div>
              <h3 className="font-semibold">
                {editingChartId
                  ? "Edit analytics"
                  : "Create analytics"}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Configure the data, visualization and colours.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setIsBuilderOpen(
                  false
                )
              }
            >
              Close
            </Button>
          </div>

          <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="analytics-name">
                    Name
                  </Label>

                  <Input
                    id="analytics-name"
                    value={
                      chartName
                    }
                    onChange={event =>
                      setChartName(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Revenue forecast"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="analytics-title">
                    Chart title
                  </Label>

                  <Input
                    id="analytics-title"
                    value={
                      config.title
                    }
                    onChange={event =>
                      updateConfig({
                        title:
                          event
                            .target
                            .value,
                      })
                    }
                    placeholder="Revenue over time"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>
                    Chart type
                  </Label>

                  <select
                    value={
                      config.chartType
                    }
                    onChange={event =>
                      updateConfig({
                        chartType:
                          event
                            .target
                            .value as AnalyticsChartConfig["chartType"],
                      })
                    }
                    className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
                  >
                    <option value="line">
                      Line
                    </option>
                    <option value="bar">
                      Bar
                    </option>
                    <option value="pie">
                      Pie / donut
                    </option>
                    <option value="scatter">
                      Scatter
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Data range
                  </Label>

                  <select
                    value={
                      config.displayMode
                    }
                    disabled={
                      config.chartType ===
                      "pie"
                    }
                    onChange={event =>
                      updateConfig({
                        displayMode:
                          event
                            .target
                            .value as AnalyticsChartConfig["displayMode"],
                      })
                    }
                    className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="periods">
                      All periods
                    </option>
                    <option value="latest">
                      Latest period
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Model
                  </Label>

                  <div className="flex h-8 items-center rounded-lg border bg-muted/30 px-2.5 text-sm">
                    {
                      selectedModel
                        .model
                        .name
                    }
                  </div>
                </div>
              </div>

              <div className="rounded-xl border">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div>
                    <h4 className="text-sm font-semibold">
                      Data series
                    </h4>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Select inputs or metrics and optionally compare scenarios.
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={
                      config.series.length >=
                        6 ||
                      config.series.length >=
                        selectedModel
                          .sources
                          .length
                    }
                    onClick={
                      addSeries
                    }
                  >
                    <Plus />
                    Add
                  </Button>
                </div>

                <div className="divide-y">
                  {config.series.map(
                    (
                      series,
                      index
                    ) => (
                      <div
                        key={
                          series.id
                        }
                        className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,180px)_42px_36px]"
                      >
                        <div className="space-y-2">
                          <Label>
                            Value {index + 1}
                          </Label>

                          <select
                            value={
                              series.sourceKey
                            }
                            onChange={event =>
                              updateSeries(
                                series.id,
                                {
                                  sourceKey:
                                    event
                                      .target
                                      .value,
                                  label:
                                    "",
                                }
                              )
                            }
                            className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
                          >
                            {selectedModel.sources.map(
                              source => (
                                <option
                                  key={
                                    source.sourceKey
                                  }
                                  value={
                                    source.sourceKey
                                  }
                                >
                                  {
                                    source.name
                                  }
                                  {" · "}
                                  {
                                    source.kind
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>
                            Scenario
                          </Label>

                          <select
                            value={
                              series.scenarioId
                            }
                            onChange={event =>
                              updateSeries(
                                series.id,
                                {
                                  scenarioId:
                                    event
                                      .target
                                      .value,
                                }
                              )
                            }
                            className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
                          >
                            <option value="base">
                              Base model
                            </option>

                            {selectedModel.scenarios.map(
                              scenario => (
                                <option
                                  key={
                                    scenario.id
                                  }
                                  value={
                                    scenario.id
                                  }
                                >
                                  {
                                    scenario.name
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>
                            Colour
                          </Label>

                          <div className="flex h-8 items-center justify-center rounded-lg border border-input bg-background">
                            <input
                              type="color"
                              value={
                                series.color
                              }
                              onChange={event =>
                                updateSeries(
                                  series.id,
                                  {
                                    color:
                                      event
                                        .target
                                        .value,
                                  }
                                )
                              }
                              className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
                              aria-label="Series colour"
                            />
                          </div>
                        </div>

                        <div className="flex items-end">
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            disabled={
                              config.series.length <=
                              1
                            }
                            onClick={() =>
                              removeSeries(
                                series.id
                              )
                            }
                            aria-label="Remove series"
                          >
                            <Trash2 />
                          </Button>
                        </div>

                        <div className="md:col-span-4">
                          <Input
                            value={
                              series.label
                            }
                            onChange={event =>
                              updateSeries(
                                series.id,
                                {
                                  label:
                                    event
                                      .target
                                      .value,
                                }
                              )
                            }
                            placeholder={`Optional label — defaults to ${getSourceLabel(
                              selectedModel,
                              series.sourceKey
                            )} · ${getScenarioLabel(
                              selectedModel,
                              series.scenarioId
                            )}`}
                          />
                        </div>
                      </div>
                    )
                  )}

                  {config.series.length ===
                    0 && (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      Add a data series to begin.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border">
                <div className="border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Palette className="size-4" />

                    <h4 className="text-sm font-semibold">
                      Appearance
                    </h4>
                  </div>
                </div>

                <div className="grid gap-4 p-4 sm:grid-cols-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={
                        config.showLegend
                      }
                      onChange={event =>
                        updateConfig({
                          showLegend:
                            event
                              .target
                              .checked,
                        })
                      }
                      className="size-4 rounded"
                    />
                    Show legend
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={
                        config.showGrid
                      }
                      onChange={event =>
                        updateConfig({
                          showGrid:
                            event
                              .target
                              .checked,
                        })
                      }
                      className="size-4 rounded"
                    />
                    Show grid
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={
                        config.showValues
                      }
                      onChange={event =>
                        updateConfig({
                          showValues:
                            event
                              .target
                              .checked,
                        })
                      }
                      className="size-4 rounded"
                    />
                    Show values
                  </label>
                </div>

                <div className="flex flex-wrap gap-2 border-t p-4">
                  <span className="mr-1 text-xs text-muted-foreground">
                    Quick palette:
                  </span>

                  {[
                    COLORS.slice(
                      0,
                      4
                    ),
                    [
                      "#0f172a",
                      "#475569",
                      "#94a3b8",
                      "#cbd5e1",
                    ],
                    [
                      "#0369a1",
                      "#0891b2",
                      "#14b8a6",
                      "#22c55e",
                    ],
                    [
                      "#7c3aed",
                      "#c026d3",
                      "#db2777",
                      "#e11d48",
                    ],
                  ].map(
                    (
                      palette,
                      paletteIndex
                    ) => (
                      <button
                        key={
                          paletteIndex
                        }
                        type="button"
                        className="flex h-7 overflow-hidden rounded-md border"
                        onClick={() =>
                          setConfig(
                            current => ({
                              ...current,
                              series:
                                current.series.map(
                                  (
                                    series,
                                    index
                                  ) => ({
                                    ...series,
                                    color:
                                      palette[
                                        index %
                                          palette.length
                                      ],
                                  })
                                ),
                            })
                          )
                        }
                        aria-label={`Apply colour palette ${paletteIndex + 1}`}
                      >
                        {palette.map(
                          color => (
                            <span
                              key={
                                color
                              }
                              className="h-full w-5"
                              style={{
                                backgroundColor:
                                  color,
                              }}
                            />
                          )
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>

              {config.chartType ===
                "scatter" && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                  Scatter uses the first selected series as X and the second as Y, with each model period represented as one observation.
                </div>
              )}

              {config.chartType ===
                "pie" && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900">
                  Pie charts use the latest period. They are best when the selected values represent parts of a meaningful whole.
                </div>
              )}

              <div className="flex justify-end gap-2 border-t pt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setIsBuilderOpen(
                      false
                    )
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={
                    isSaving ||
                    config.series.length ===
                      0
                  }
                  onClick={
                    save
                  }
                >
                  {isSaving
                    ? "Saving..."
                    : editingChartId
                      ? "Update chart"
                      : "Save chart"}
                </Button>
              </div>
            </div>

            <div className="min-w-0">
              <div className="sticky top-4 rounded-xl border bg-muted/10 p-4">
                <div className="mb-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Live preview
                  </p>

                  <h4 className="mt-1 font-semibold">
                    {config.title ||
                      "Untitled chart"}
                  </h4>
                </div>

                <AnalyticsChart
                  modelData={
                    selectedModel
                  }
                  config={
                    config
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}