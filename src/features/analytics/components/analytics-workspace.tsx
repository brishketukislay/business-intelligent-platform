"use client";

import {
useEffect,
useMemo,
useRef,
useState,
type PointerEvent,
} from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import {
Dialog,
DialogContent,
DialogDescription,
DialogFooter,
DialogHeader,
DialogTitle,
} from "@/components/ui/dialog";

import {
Plus,
Trash2,
Pencil,
BarChart3,
LineChart as LineChartIcon,
PieChart as PieChartIcon,
ScatterChart as ScatterChartIcon,
Palette,
Eye,
EyeOff,
Settings2,
X,
Check,
} from "lucide-react";

import {
saveAnalyticsChartAction,
updateAnalyticsChartAction,
deleteAnalyticsChartAction,
setAnalyticsChartVisibilityAction,
updateAnalyticsChartLayoutAction,
} from "../actions/analytics-actions";

import { AnalyticsChart } from "./analytics-chart";
import { AnalyticsPresentation } from "./analytics-presentation";

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

const DEFAULT_WIDTH = 560;
const DEFAULT_HEIGHT = 360;

const CHART_DEFAULTS: AnalyticsChartConfig = {
title: "New analytics",
chartType: "line",
displayMode: "periods",
series: [],
showLegend: true,
showGrid: true,
showValues: false,
width: DEFAULT_WIDTH,
height: DEFAULT_HEIGHT,
isVisible: true,
};

type Props = AnalyticsDashboardData;

function makeSeries(
sourceKey: string,
index: number,
): AnalyticsSeriesConfig {
return {
id: `${Date.now()}-${index}`,
sourceKey,
scenarioId: "base",
label: "",
color: COLORS[index % COLORS.length],
};
}

function emptyConfigForModel(
modelData: AnalyticsModelData,
): AnalyticsChartConfig {
const firstSource = modelData.sources[0];

return {
...CHART_DEFAULTS,
title: firstSource
? `${firstSource.name} over time`
: "New analytics",
series: firstSource
? [makeSeries(firstSource.sourceKey, 0)]
: [],
};
}

function getSourceLabel(
modelData: AnalyticsModelData,
sourceKey: string,
) {
return (
modelData.sources.find(
(source) => source.sourceKey === sourceKey,
)?.name ?? "Unknown source"
);
}

function getScenarioLabel(
modelData: AnalyticsModelData,
scenarioId: string,
) {
if (scenarioId === "base") {
return "Base model";
}

return (
modelData.scenarios.find(
(scenario) => scenario.id === scenarioId,
)?.name ?? "Unknown scenario"
);
}

function ChartTypeIcon({
type,
}: {
type: AnalyticsChartConfig["chartType"];
}) {
if (type === "line") {
return <LineChartIcon className="size-4" />;
}

if (type === "bar") {
return <BarChart3 className="size-4" />;
}

if (type === "pie") {
return <PieChartIcon className="size-4" />;
}

return <ScatterChartIcon className="size-4" />;
}

function ResizeHandle({
  onResize,
}: {
  onResize: (width: number, height: number) => void;
}) {
  const resizing = useRef(false);

  const start = useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const handlePointerDown = (
    event: PointerEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const element = event.currentTarget.parentElement;

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();

    start.current = {
      x: event.clientX,
      y: event.clientY,
      width: rect.width,
      height: rect.height,
    };

    resizing.current = true;

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  };

  const handlePointerMove = (
    event: PointerEvent<HTMLButtonElement>,
  ) => {
    if (!resizing.current) {
      return;
    }

    const width = Math.max(
      320,
      Math.min(
        1400,
        start.current.width +
          (event.clientX - start.current.x),
      ),
    );

    const height = Math.max(
      280,
      Math.min(
        900,
        start.current.height +
          (event.clientY - start.current.y),
      ),
    );

    onResize(
      Math.round(width),
      Math.round(height),
    );
  };

  const handlePointerUp = (
    event: PointerEvent<HTMLButtonElement>,
  ) => {
    resizing.current = false;

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId,
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    }
  };

  return (
    <button
      type="button"
      aria-label="Resize chart"
      className="absolute bottom-0 right-0 z-10 flex size-7 cursor-nwse-resize items-end justify-end rounded-tl-md bg-background p-1.5 text-muted-foreground shadow-sm"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={(event) => event.stopPropagation()}
    >
      <svg
        viewBox="0 0 12 12"
        className="size-4"
        aria-hidden="true"
      >
        <path
          d="M2 10L10 2M6 10L10 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

function ChartCard({
chart,
modelData,
onEdit,
onHide,
onDelete,
onResize,
}: {
chart: AnalyticsChartRecord;
modelData: AnalyticsModelData;
onEdit: (chart: AnalyticsChartRecord) => void;
onHide: (chart: AnalyticsChartRecord) => void;
onDelete: (chart: AnalyticsChartRecord) => void;
onResize: (
chart: AnalyticsChartRecord,
width: number,
height: number,
) => void;
}) {
const width =
chart.config.width ?? DEFAULT_WIDTH;

const height =
chart.config.height ?? DEFAULT_HEIGHT;

return (
<article
className="relative min-w-[320px] max-w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm"
style={{
width,
height,
}}
> <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3"> <div className="flex min-w-0 items-center gap-2"> <ChartTypeIcon type={chart.config.chartType} />
      <h3 className="truncate text-sm font-semibold">
        {chart.name}
      </h3>
    </div>

    <div className="flex shrink-0 items-center gap-0.5">
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Edit chart"
        onClick={() => onEdit(chart)}
      >
        <Pencil />
      </Button>

      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Hide chart"
        onClick={() => onHide(chart)}
      >
        <EyeOff />
      </Button>

      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className="text-destructive hover:text-destructive"
        aria-label="Delete chart"
        onClick={() => onDelete(chart)}
      >
        <X />
      </Button>
    </div>
  </div>

  <div className="h-[calc(100%-3rem)] w-full p-3">
    <AnalyticsChart
      modelData={modelData}
      config={{
        ...chart.config,
        width,
        height: Math.max(280, height - 48),
      }}
    />
  </div>

  <ResizeHandle
    onResize={(nextWidth, nextHeight) =>
      onResize(
        chart,
        nextWidth,
        nextHeight,
      )
    }
  />
</article>

);
}

export default function AnalyticsWorkspace({
models,
charts,
}: Props) {
const router = useRouter();

const [
selectedModelId,
setSelectedModelId,
] = useState("");

const [
editingChartId,
setEditingChartId,
] = useState<string | null>(null);

const [
config,
setConfig,
] = useState<AnalyticsChartConfig>(
CHART_DEFAULTS,
);

const [
chartName,
setChartName,
] = useState("");

const [
isBuilderOpen,
setIsBuilderOpen,
] = useState(false);

const [
isManageOpen,
setIsManageOpen,
] = useState(false);

const [
isPresentationMode,
setIsPresentationMode,
] = useState(false);

const [
deleteTarget,
setDeleteTarget,
] = useState<AnalyticsChartRecord | null>(
null,
);

const [
hideTarget,
setHideTarget,
] = useState<AnalyticsChartRecord | null>(
null,
);

const [
isSaving,
setIsSaving,
] = useState(false);

const [
error,
setError,
] = useState<string | null>(null);

const [
resizing,
setResizing,
] = useState<
Record<
string,
{
width: number;
height: number;
}
>

> ({});

const modelMap = useMemo(
() =>
new Map(
models.map((model) => [
model.model.id,
model,
]),
),
[models],
);

const visibleCharts = useMemo(
() =>
charts.filter(
(chart) =>
chart.config.isVisible !== false,
),
[charts],
);

const hiddenCharts = useMemo(
() =>
charts.filter(
(chart) =>
chart.config.isVisible === false,
),
[charts],
);

const selectedModel =
modelMap.get(selectedModelId);

useEffect(() => {
if (
isBuilderOpen &&
!selectedModelId &&
models[0]
) {
setSelectedModelId(
models[0].model.id,
);
}
}, [
isBuilderOpen,
selectedModelId,
models,
]);

function openCreate() {
const firstModel = models[0];

if (!firstModel) {
  return;
}

setSelectedModelId(
  firstModel.model.id,
);

const next =
  emptyConfigForModel(firstModel);

setEditingChartId(null);
setConfig(next);
setChartName("");
setError(null);
setIsBuilderOpen(true);

}

function changeBuilderModel(
modelId: string,
) {
const model = modelMap.get(modelId);

if (!model) {
  return;
}

setSelectedModelId(modelId);

if (!editingChartId) {
  const next =
    emptyConfigForModel(model);

  setConfig(next);
  setChartName("");
}

}

function openEdit(
chart: AnalyticsChartRecord,
) {
const model = modelMap.get(
chart.modelId,
);

if (!model) {
  setError(
    "The model for this chart is no longer available.",
  );
  return;
}

setSelectedModelId(chart.modelId);
setEditingChartId(chart.id);

setConfig({
  ...chart.config,
  width:
    chart.config.width ??
    DEFAULT_WIDTH,
  height:
    chart.config.height ??
    DEFAULT_HEIGHT,
  isVisible:
    chart.config.isVisible ??
    true,
});

setChartName(chart.name);
setError(null);
setIsBuilderOpen(true);

}

function updateConfig(
patch: Partial<AnalyticsChartConfig>,
) {
setConfig((current) => ({
...current,
...patch,
}));
}

function updateSeries(
id: string,
patch: Partial<AnalyticsSeriesConfig>,
) {
setConfig((current) => ({
...current,
series: current.series.map(
(series) =>
series.id === id
? {
...series,
...patch,
}
: series,
),
}));
}

function addSeries() {
if (!selectedModel) {
return;
}

const source =
  selectedModel.sources.find(
    (item) =>
      !config.series.some(
        (series) =>
          series.sourceKey ===
          item.sourceKey,
      ),
  );

if (!source) {
  return;
}

setConfig((current) => ({
  ...current,
  series: [
    ...current.series,
    makeSeries(
      source.sourceKey,
      current.series.length,
    ),
  ],
}));

}

function removeSeries(id: string) {
setConfig((current) => ({
...current,
series: current.series.filter(
(series) =>
series.id !== id,
),
}));
}

async function save() {
if (!selectedModel) {
setError("Select a model first.");
return;
}

if (config.series.length === 0) {
  setError(
    "Select at least one input or metric.",
  );
  return;
}

if (
  config.chartType === "scatter" &&
  config.series.length !== 2
) {
  setError(
    "Scatter charts require exactly two series.",
  );
  return;
}

setIsSaving(true);
setError(null);

const payload = {
  modelId: selectedModel.model.id,
  name:
    chartName.trim() ||
    config.title.trim() ||
    "Analytics",
  config: {
    ...config,
    title:
      config.title.trim() ||
      chartName.trim() ||
      "Analytics",
    isVisible: true,
    width:
      config.width ??
      DEFAULT_WIDTH,
    height:
      config.height ??
      DEFAULT_HEIGHT,
    series: config.series.map(
      (series) => ({
        ...series,
        label: series.label.trim(),
      }),
    ),
  },
};

try {
  const result =
    editingChartId
      ? await updateAnalyticsChartAction(
          editingChartId,
          payload,
        )
      : await saveAnalyticsChartAction(
          payload,
        );

  if (!result.success) {
    setError(
      result.error ??
        "Unable to save analytics.",
    );
    return;
  }

  setIsBuilderOpen(false);
  setEditingChartId(null);
  router.refresh();
} catch (saveError) {
  console.error(saveError);

  setError(
    "An unexpected error occurred while saving.",
  );
} finally {
  setIsSaving(false);
}

}

async function confirmDelete() {
if (!deleteTarget) {
return;
}

const chart = deleteTarget;

setDeleteTarget(null);

const result =
  await deleteAnalyticsChartAction(
    chart.id,
  );

if (!result.success) {
  setError(
    result.error ??
      "Unable to delete chart.",
  );
  return;
}

router.refresh();

}

async function confirmHide() {
if (!hideTarget) {
return;
}

const chart = hideTarget;

setHideTarget(null);

const result =
  await setAnalyticsChartVisibilityAction(
    chart.id,
    false,
  );

if (!result.success) {
  setError(
    result.error ??
      "Unable to hide chart.",
  );
  return;
}

router.refresh();

}

async function restoreChart(
chart: AnalyticsChartRecord,
) {
const result =
await setAnalyticsChartVisibilityAction(
chart.id,
true,
);

if (!result.success) {
  setError(
    result.error ??
      "Unable to restore chart.",
  );
  return;
}

router.refresh();

}

function resizeChart(
chart: AnalyticsChartRecord,
width: number,
height: number,
) {
setResizing((current) => ({
...current,
[chart.id]: {
width,
height,
},
}));
}

useEffect(() => {
const entries =
Object.entries(resizing);

if (entries.length === 0) {
  return;
}

const timer =
  window.setTimeout(
    async () => {
      for (
        const [
          chartId,
          dimensions,
        ] of entries
      ) {
        const result =
          await updateAnalyticsChartLayoutAction(
            chartId,
            dimensions,
          );

        if (!result.success) {
          console.error(
            result.error,
          );
        }
      }

      setResizing({});
      router.refresh();
    },
    700,
  );

return () =>
  window.clearTimeout(timer);

}, [resizing, router]);

if (models.length === 0) {
return ( <section className="rounded-xl border border-dashed bg-background p-10 text-center"> <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"> <BarChart3 className="size-6" /> </div>

    <h2 className="mt-4 font-semibold">
      No models available
    </h2>

    <p className="mt-1 text-sm text-muted-foreground">
      Create or get access to a business
      model before adding analytics.
    </p>
  </section>
);

}

return ( <section className="space-y-5">
{/* Dashboard header */} <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"> <div> <h2 className="text-xl font-semibold tracking-tight">
Analytics </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Your saved charts appear here
        automatically.
      </p>
    </div>

    <div className="flex items-center gap-2">
      {hiddenCharts.length > 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setIsManageOpen(true)
          }
        >
          <Settings2 />
          Manage hidden

          <span className="ml-1 rounded-full bg-muted px-1.5 text-xs">
            {hiddenCharts.length}
          </span>
        </Button>
      )}

      <Button
        type="button"
        onClick={openCreate}
      >
        <Plus />
        Add analytics
      </Button>

      <Button
        type="button"
        variant="outline"
        disabled={visibleCharts.length === 0}
        onClick={() =>
          setIsPresentationMode(true)
        }
      >
        Present
      </Button>
    </div>
  </div>

  {/* Dashboard error */}
  {error && !isBuilderOpen && (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <span>{error}</span>

      <button
        type="button"
        onClick={() =>
          setError(null)
        }
        aria-label="Dismiss error"
      >
        <X className="size-4" />
      </button>
    </div>
  )}

  {/* Charts */}
  {visibleCharts.length === 0 ? (
    <div className="rounded-xl border border-dashed bg-background p-10 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <BarChart3 className="size-6" />
      </div>

      <h3 className="mt-4 font-semibold">
        No analytics on your dashboard
      </h3>

      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Create your first chart from an
        input or metric in any model.
      </p>

      <Button
        className="mt-5"
        type="button"
        onClick={openCreate}
      >
        <Plus />
        Add your first chart
      </Button>
    </div>
  ) : (
    <div className="flex flex-wrap items-start gap-5">
      {visibleCharts.map((chart) => {
        const model = modelMap.get(
          chart.modelId,
        );

        if (!model) {
          return null;
        }

        const dimensions =
          resizing[chart.id];

        const effectiveChart =
          dimensions
            ? {
                ...chart,
                config: {
                  ...chart.config,
                  width:
                    dimensions.width,
                  height:
                    dimensions.height,
                },
              }
            : chart;

        return (
          <ChartCard
            key={chart.id}
            chart={effectiveChart}
            modelData={model}
            onEdit={openEdit}
            onHide={setHideTarget}
            onDelete={setDeleteTarget}
            onResize={resizeChart}
          />
        );
      })}
    </div>
  )}

  {/* Presentation mode */}
  {isPresentationMode && (
    <AnalyticsPresentation
      charts={visibleCharts}
      modelMap={modelMap}
      onExit={() =>
        setIsPresentationMode(false)
      }
    />
  )}

  {/* Analytics builder */}
  <Dialog
    open={isBuilderOpen}
    onOpenChange={(open) => {
      setIsBuilderOpen(open);

      if (!open) {
        setEditingChartId(null);
        setError(null);
      }
    }}
  >
    <DialogContent
      showCloseButton={false}
      className={cn(
        "flex",
        "h-[min(900px,92vh)]",
        "w-[min(1400px,96vw)]",
        "max-w-none",
        "flex-col",
        "gap-0",
        "overflow-hidden",
        "rounded-2xl",
        "bg-background",
        "p-0",
        "bg-background", "text-foreground", "shadow-xl"
      )}
    >
      {/* HEADER */}
      <div className="relative flex shrink-0 items-center justify-between border-b border-border bg-background px-6 py-4">
        <div className="min-w-0 pr-12">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {editingChartId
              ? "Edit analytics"
              : "Create analytics"}
          </DialogTitle>

          <DialogDescription className="mt-1">
            Build a chart from your model data and
            preview it before saving.
          </DialogDescription>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsBuilderOpen(false);
            setEditingChartId(null);
            setError(null);
          }}
          className={cn(
            "absolute right-5 top-5",
            "flex size-9 items-center justify-center",
            "rounded-lg border border-border",
            "bg-background text-muted-foreground",
            "transition-colors",
            "hover:bg-muted hover:text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring/30",
          )}
          aria-label="Close analytics builder"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="grid h-full min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(400px,480px)]">
          {/* LEFT — CONFIGURATION */}
          <div className="min-h-0 overflow-y-auto">
            <div className="mx-auto w-full max-w-4xl space-y-6 p-6 lg:p-8">
              {/* MODEL + CHART NAME */}
              <div className="rounded-xl border border-border bg-background">
                <div className="border-b border-border px-5 py-4">
                  <h3 className="text-sm font-semibold">
                    Chart setup
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Choose where the data comes from and
                    give this chart a name.
                  </p>
                </div>

                <div className="grid gap-5 p-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="analytics-model">
                      Model
                    </Label>

                    <select
                      id="analytics-model"
                      value={selectedModelId}
                      disabled={Boolean(
                        editingChartId,
                      )}
                      onChange={(event) =>
                        changeBuilderModel(
                          event.target.value,
                        )
                      }
                      className={cn(
                        "h-10 w-full rounded-lg",
                        "border border-input",
                        "bg-background px-3 text-sm",
                        "outline-none transition",
                        "focus:border-ring",
                        "focus:ring-3 focus:ring-ring/20",
                        "disabled:cursor-not-allowed",
                        "disabled:bg-muted",
                        "disabled:text-muted-foreground",
                      )}
                    >
                      {models.map((model) => (
                        <option
                          key={model.model.id}
                          value={model.model.id}
                        >
                          {model.model.name}
                        </option>
                      ))}
                    </select>

                    {editingChartId && (
                      <p className="text-xs text-muted-foreground">
                        The model cannot be changed when
                        editing an existing chart.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="analytics-name">
                      Chart name
                    </Label>

                    <Input
                      id="analytics-name"
                      value={chartName}
                      onChange={(event) =>
                        setChartName(
                          event.target.value,
                        )
                      }
                      placeholder="Annual target"
                      className="h-10"
                    />

                    <p className="text-xs text-muted-foreground">
                      Used to identify this chart on your
                      dashboard.
                    </p>
                  </div>
                </div>
              </div>

              {selectedModel && (
                <>
                  {/* TYPE + TITLE */}
                  <div className="rounded-xl border border-border bg-background">
                    <div className="border-b border-border px-5 py-4">
                      <h3 className="text-sm font-semibold">
                        Chart appearance
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Choose how your data should be
                        visualised.
                      </p>
                    </div>

                    <div className="space-y-5 p-5">
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Chart type</Label>

                          <select
                            value={
                              config.chartType
                            }
                            onChange={(event) => {
                              const chartType =
                                event.target
                                  .value as AnalyticsChartConfig["chartType"];

                              updateConfig({
                                chartType,
                                displayMode:
                                  chartType ===
                                  "pie"
                                    ? "latest"
                                    : config.displayMode,
                              });
                            }}
                            className={cn(
                              "h-10 w-full rounded-lg",
                              "border border-input",
                              "bg-background px-3 text-sm",
                              "outline-none transition",
                              "focus:border-ring",
                              "focus:ring-3 focus:ring-ring/20",
                            )}
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
                          <Label>Chart title</Label>

                          <Input
                            value={config.title}
                            onChange={(event) =>
                              updateConfig({
                                title:
                                  event.target
                                    .value,
                              })
                            }
                            placeholder="Annual target over time"
                            className="h-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Data range</Label>

                        <select
                          value={
                            config.displayMode
                          }
                          disabled={
                            config.chartType ===
                            "pie"
                          }
                          onChange={(event) =>
                            updateConfig({
                              displayMode:
                                event.target
                                  .value as AnalyticsChartConfig["displayMode"],
                            })
                          }
                          className={cn(
                            "h-10 w-full rounded-lg",
                            "border border-input",
                            "bg-background px-3 text-sm",
                            "outline-none transition",
                            "focus:border-ring",
                            "focus:ring-3 focus:ring-ring/20",
                            "disabled:cursor-not-allowed",
                            "disabled:bg-muted",
                            "disabled:text-muted-foreground",
                          )}
                        >
                          <option value="periods">
                            All periods
                          </option>

                          <option value="latest">
                            Latest period
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* VALUES */}
                  <div className="rounded-xl border border-border bg-background">
                    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                      <div>
                        <h3 className="text-sm font-semibold">
                          Values
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Select the inputs or metrics you
                          want to compare.
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
                              .sources.length
                        }
                        onClick={addSeries}
                      >
                        <Plus />
                        Add value
                      </Button>
                    </div>

                    <div className="divide-y divide-border">
                      {config.series.map(
                        (series, index) => (
                          <div
                            key={series.id}
                            className="p-5"
                          >
                            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px_44px]">
                              {/* VALUE */}
                              <div className="space-y-2">
                                <Label>
                                  Value{" "}
                                  {index + 1}
                                </Label>

                                <select
                                  value={
                                    series.sourceKey
                                  }
                                  onChange={(event) =>
                                    updateSeries(
                                      series.id,
                                      {
                                        sourceKey:
                                          event
                                            .target
                                            .value,
                                        label: "",
                                      },
                                    )
                                  }
                                  className={cn(
                                    "h-10 w-full rounded-lg",
                                    "border border-input",
                                    "bg-background px-3 text-sm",
                                    "outline-none",
                                    "focus:border-ring",
                                    "focus:ring-3 focus:ring-ring/20",
                                  )}
                                >
                                  {selectedModel.sources.map(
                                    (
                                      source,
                                    ) => (
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
                                    ),
                                  )}
                                </select>

                                <Input
                                  value={
                                    series.label
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateSeries(
                                      series.id,
                                      {
                                        label:
                                          event
                                            .target
                                            .value,
                                      },
                                    )
                                  }
                                  placeholder={`Optional — defaults to ${getSourceLabel(
                                    selectedModel,
                                    series.sourceKey,
                                  )} · ${getScenarioLabel(
                                    selectedModel,
                                    series.scenarioId,
                                  )}`}
                                  className="h-10"
                                />
                              </div>

                              {/* SCENARIO + COLOR */}
                              <div className="space-y-2">
                                <Label>
                                  Scenario
                                </Label>

                                <select
                                  value={
                                    series.scenarioId
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateSeries(
                                      series.id,
                                      {
                                        scenarioId:
                                          event
                                            .target
                                            .value,
                                      },
                                    )
                                  }
                                  className={cn(
                                    "h-10 w-full rounded-lg",
                                    "border border-input",
                                    "bg-background px-3 text-sm",
                                    "outline-none",
                                    "focus:border-ring",
                                    "focus:ring-3 focus:ring-ring/20",
                                  )}
                                >
                                  <option value="base">
                                    Base model
                                  </option>

                                  {selectedModel.scenarios.map(
                                    (
                                      scenario,
                                    ) => (
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
                                    ),
                                  )}
                                </select>

                                <div className="flex h-10 items-center gap-3 rounded-lg border border-input bg-background px-3">
                                  <Palette className="size-4 shrink-0 text-muted-foreground" />

                                  <input
                                    type="color"
                                    value={
                                      series.color
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      updateSeries(
                                        series.id,
                                        {
                                          color:
                                            event
                                              .target
                                              .value,
                                        },
                                      )
                                    }
                                    className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
                                    aria-label="Series colour"
                                  />

                                  <span className="font-mono text-xs text-muted-foreground">
                                    {
                                      series.color
                                    }
                                  </span>
                                </div>
                              </div>

                              {/* REMOVE */}
                              <div className="flex items-end justify-end">
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="ghost"
                                  disabled={
                                    config
                                      .series
                                      .length <=
                                    1
                                  }
                                  onClick={() =>
                                    removeSeries(
                                      series.id,
                                    )
                                  }
                                  aria-label="Remove value"
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>

                    {/* QUICK COLORS */}
                    <div className="border-t border-border px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="mr-2 text-xs font-medium text-muted-foreground">
                          Quick colours
                        </span>

                        {[
                          COLORS.slice(0, 4),
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
                            paletteIndex,
                          ) => (
                            <button
                              key={
                                paletteIndex
                              }
                              type="button"
                              className={cn(
                                "flex h-8 overflow-hidden rounded-lg",
                                "border border-border",
                                "transition",
                                "hover:scale-105",
                                "hover:border-foreground/30",
                              )}
                              onClick={() =>
                                setConfig(
                                  (
                                    current,
                                  ) => ({
                                    ...current,
                                    series:
                                      current.series.map(
                                        (
                                          series,
                                          index,
                                        ) => ({
                                          ...series,
                                          color:
                                            palette[
                                              index %
                                                palette.length
                                            ],
                                        }),
                                      ),
                                  }),
                                )
                              }
                              aria-label={`Apply colour palette ${
                                paletteIndex +
                                1
                              }`}
                            >
                              {palette.map(
                                (
                                  color,
                                ) => (
                                  <span
                                    key={
                                      color
                                    }
                                    className="h-full w-6"
                                    style={{
                                      backgroundColor:
                                        color,
                                    }}
                                  />
                                ),
                              )}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  {/* APPEARANCE */}
                  <div className="rounded-xl border border-border bg-background">
                    <div className="border-b border-border px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Palette className="size-4 text-muted-foreground" />

                        <h3 className="text-sm font-semibold">
                          Display options
                        </h3>
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Fine-tune how the chart is presented.
                      </p>
                    </div>

                    <div className="grid gap-3 p-5 sm:grid-cols-3">
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted/50">
                        <input
                          type="checkbox"
                          checked={
                            config.showLegend
                          }
                          onChange={(event) =>
                            updateConfig({
                              showLegend:
                                event.target
                                  .checked,
                            })
                          }
                          className="size-4 rounded"
                        />

                        <span>
                          Show legend
                        </span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted/50">
                        <input
                          type="checkbox"
                          checked={
                            config.showGrid
                          }
                          onChange={(event) =>
                            updateConfig({
                              showGrid:
                                event.target
                                  .checked,
                            })
                          }
                          className="size-4 rounded"
                        />

                        <span>
                          Show grid
                        </span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted/50">
                        <input
                          type="checkbox"
                          checked={
                            config.showValues
                          }
                          onChange={(event) =>
                            updateConfig({
                              showValues:
                                event.target
                                  .checked,
                            })
                          }
                          className="size-4 rounded"
                        />

                        <span>
                          Show values
                        </span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT — PREVIEW */}
          <aside className="hidden min-h-0 border-l border-border bg-muted/20 lg:block">
            <div className="flex h-full min-h-0 flex-col">
              <div className="shrink-0 border-b border-border px-6 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Live preview
                </p>

                <h3 className="mt-1 truncate text-base font-semibold">
                  {config.title ||
                    chartName ||
                    "Untitled chart"}
                </h3>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-6">
                <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
                  {selectedModel ? (
                    <AnalyticsChart
                      modelData={
                        selectedModel
                      }
                      config={{
                        ...config,
                        width: 440,
                        height: 340,
                      }}
                    />
                  ) : (
                    <div className="flex h-[340px] items-center justify-center rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
                      Select a model to preview
                      your chart.
                    </div>
                  )}
                </div>

                {selectedModel && (
                  <div className="mt-4 rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Data source
                      </span>

                      <span className="max-w-[220px] truncate text-xs font-medium">
                        {
                          selectedModel
                            .model.name
                        }
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Values
                      </span>

                      <span className="text-xs font-medium">
                        {
                          config.series
                            .length
                        }
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Chart type
                      </span>

                      <span className="text-xs font-medium capitalize">
                        {
                          config.chartType
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="shrink-0 border-t border-destructive/20 bg-destructive/5 px-6 py-3">
          <div className="flex items-center justify-between gap-4 text-sm text-destructive">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError(null)
              }
              aria-label="Dismiss error"
              className="rounded-md p-1 hover:bg-destructive/10"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex shrink-0 items-center justify-between border-t border-border bg-background px-6 py-4">
        <div className="hidden text-xs text-muted-foreground sm:block">
          {selectedModel
            ? `${config.series.length} value${
                config.series.length ===
                1
                  ? ""
                  : "s"
              } selected`
            : "Select a model to continue"}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsBuilderOpen(false);
              setEditingChartId(null);
              setError(null);
            }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={
              isSaving ||
              !selectedModel ||
              config.series.length === 0
            }
            onClick={save}
          >
            {isSaving ? (
              "Saving..."
            ) : editingChartId ? (
              <>
                <Check />
                Save changes
              </>
            ) : (
              <>
                <Check />
                Save chart
              </>
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  {/* Delete confirmation */}
  <Dialog
    open={Boolean(deleteTarget)}
    onOpenChange={(open) => {
      if (!open) {
        setDeleteTarget(null);
      }
    }}
  >
    <DialogContent className="max-w-md bg-background text-foreground shadow-xl">
      <DialogHeader>
        <DialogTitle>
          Delete analytics chart?
        </DialogTitle>

        <DialogDescription>
          This will permanently remove{" "}
          <span className="font-medium text-foreground">
            {deleteTarget?.name ??
              "this chart"}
          </span>{" "}
          from your dashboard.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setDeleteTarget(null)
          }
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="destructive"
          onClick={confirmDelete}
        >
          <Trash2 />
          Delete chart
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  {/* Hide confirmation */}
  <Dialog
    open={Boolean(hideTarget)}
    onOpenChange={(open) => {
      if (!open) {
        setHideTarget(null);
      }
    }}
  >
    <DialogContent className="max-w-md bg-background text-foreground shadow-xl">
      <DialogHeader>
        <DialogTitle>
          Hide analytics chart?
        </DialogTitle>

        <DialogDescription>
          <span className="font-medium text-foreground">
            {hideTarget?.name ??
              "This chart"}
          </span>{" "}
          will be removed from the dashboard, but you can restore it
          later from Manage hidden.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setHideTarget(null)
          }
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={confirmHide}
        >
          <EyeOff />
          Hide chart
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  {/* Manage hidden charts */}
  <Dialog
    open={isManageOpen}
    onOpenChange={setIsManageOpen}
  >
    <DialogContent className="max-w-lg bg-background text-foreground shadow-xl">
      <DialogHeader>
        <DialogTitle>
          Hidden analytics
        </DialogTitle>

        <DialogDescription>
          Charts hidden from your dashboard can be restored here.
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-[50vh] overflow-y-auto px-6">
        {hiddenCharts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <Eye className="mx-auto size-6 text-muted-foreground" />

            <p className="mt-3 text-sm font-medium">
              No hidden charts
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Hidden charts will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {hiddenCharts.map((chart) => {
              const model =
                modelMap.get(
                  chart.modelId,
                );

              return (
                <div
                  key={chart.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {chart.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {model?.model.name ??
                        "Unknown model"}
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      restoreChart(
                        chart,
                      )
                    }
                  >
                    <Eye />
                    Show
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setIsManageOpen(false)
          }
        >
          Done
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</section>

);
}
