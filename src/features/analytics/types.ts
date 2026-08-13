export const ANALYTICS_CHART_TYPES = [
  "line",
  "bar",
  "pie",
  "scatter",
] as const;

export type AnalyticsChartType =
  (typeof ANALYTICS_CHART_TYPES)[number];

export const ANALYTICS_DISPLAY_MODES = [
  "periods",
  "latest",
] as const;

export type AnalyticsDisplayMode =
  (typeof ANALYTICS_DISPLAY_MODES)[number];

export type AnalyticsSourceKind =
  | "input"
  | "metric";

export type AnalyticsSource = {
  sourceKey: string;
  id: string;
  kind: AnalyticsSourceKind;
  name: string;
  key: string;
  type: string;
  unit: string | null;
  category: string | null;
};

export type AnalyticsPeriod = {
  id: string;
  name: string;
  key: string;
};

export type AnalyticsScenario = {
  id: string;
  name: string;
};

export type AnalyticsSeriesConfig = {
  id: string;
  sourceKey: string;
  scenarioId: string;

  /**
   * Optional custom label.
   *
   * An empty string means "use the source/scenario name".
   */
  label: string;

  color: string;
};

export type AnalyticsChartConfig = {
  title: string;
  chartType: AnalyticsChartType;
  displayMode: AnalyticsDisplayMode;
  series: AnalyticsSeriesConfig[];
  showLegend: boolean;
  showGrid: boolean;
  showValues: boolean;

  /**
   * Dashboard layout.
   */
  width?: number;
  height?: number;

  /**
   * Controls visibility inside the model's
   * Analytics workspace.
   *
   * This is NOT dashboard pinning.
   */
  isVisible?: boolean;

  /**
   * Controls whether this chart appears
   * on the main dashboard.
   */
  isPinned?: boolean;
};

export type AnalyticsChartRecord = {
  id: string;
  modelId: string;
  name: string;
  config: AnalyticsChartConfig;
  createdAt: string;
  updatedAt: string;
};

export type AnalyticsModelData = {
  model: {
    id: string;
    name: string;
  };

  periods: AnalyticsPeriod[];
  sources: AnalyticsSource[];
  scenarios: AnalyticsScenario[];

  values: Record<
    string,
    Array<number | null>
  >;

  scenarioValues: Record<
    string,
    Record<string, Array<number | null>>
  >;
};

export type AnalyticsDashboardData = {
  models: AnalyticsModelData[];
  charts: AnalyticsChartRecord[];
};