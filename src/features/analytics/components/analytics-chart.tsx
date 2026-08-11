"use client";

import {
  useMemo,
} from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  AnalyticsChartConfig,
  AnalyticsModelData,
  AnalyticsSeriesConfig,
} from "../types";

const DEFAULT_COLORS = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#9333ea",
  "#0891b2",
  "#dc2626",
];

type Props = {
  modelData: AnalyticsModelData;
  config: AnalyticsChartConfig;
  compact?: boolean;
};

type SeriesWithValues =
  AnalyticsSeriesConfig & {
    sourceName: string;
    scenarioName: string;
    values: Array<
      number | null
    >;
  };

function formatValue(
  value: number
) {
  return new Intl.NumberFormat(
    "en-GB",
    {
      notation: "compact",
      maximumFractionDigits: 2,
    }
  ).format(value);
}

function getSeriesValues(
  modelData: AnalyticsModelData,
  series: AnalyticsSeriesConfig
) {
  if (
    series.scenarioId ===
    "base"
  ) {
    return (
      modelData.values[
        series.sourceKey
      ] ?? []
    );
  }

  return (
    modelData.scenarioValues[
      series.scenarioId
    ]?.[
      series.sourceKey
    ] ?? []
  );
}

function buildSeries(
  modelData: AnalyticsModelData,
  config: AnalyticsChartConfig
): SeriesWithValues[] {
  return config.series.flatMap(
    (series, index) => {
      const source =
        modelData.sources.find(
          item =>
            item.sourceKey ===
            series.sourceKey
        );

      if (!source) {
        return [];
      }

      const scenarioName =
        series.scenarioId ===
        "base"
          ? "Base model"
          : modelData.scenarios.find(
              scenario =>
                scenario.id ===
                series.scenarioId
            )?.name ??
            "Scenario";

return [
  {
    ...series,
    color:
      series.color ||
      DEFAULT_COLORS[
        index %
          DEFAULT_COLORS.length
      ],
    sourceName:
      series.label.trim() ||
      source.name,
    scenarioName,
    values:
      getSeriesValues(
        modelData,
        series
      ),
  },
];
    }
  );
}

function buildTimeData(
  modelData: AnalyticsModelData,
  series: SeriesWithValues[]
) {
  return modelData.periods.map(
    (period, index) => {
      const row:
        Record<
          string,
          string | number | null
        > = {
        period:
          period.name,
      };

      series.forEach(
        (item, seriesIndex) => {
          row[
            `series_${seriesIndex}`
          ] =
            item.values[
              index
            ] ?? null;
        }
      );

      return row;
    }
  );
}

function EmptyChart({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function AnalyticsChart({
  modelData,
  config,
  compact = false,
}: Props) {
  const series =
    useMemo(
      () =>
        buildSeries(
          modelData,
          config
        ),
      [modelData, config]
    );

const height =
  config.height ??
  (compact ? 260 : 360);

  if (
    series.length === 0
  ) {
    return (
      <EmptyChart
        message="The selected data is no longer available."
      />
    );
  }

  if (
    config.chartType ===
    "pie"
  ) {
    const pieData =
      series
        .map(
          (item, index) => ({
            name:
              item.scenarioId ===
              "base"
                ? item.sourceName
                : `${item.sourceName} · ${item.scenarioName}`,
            value:
              item.values[
                item.values.length -
                  1
              ],
            color:
              item.color ||
              DEFAULT_COLORS[
                index %
                  DEFAULT_COLORS.length
              ],
          })
        )
        .filter(
          item =>
            item.value !==
              null &&
            Number.isFinite(
              item.value
            )
        );

    if (
      pieData.length === 0
    ) {
      return (
        <EmptyChart
          message="There are no numeric values available for the selected period."
        />
      );
    }

    return (
      <div
        className="w-full"
      >
        <ResponsiveContainer
          width="100%"
          height={height}
        >
          <PieChart>
            <Tooltip
              formatter={(
                value
              ) =>
                formatValue(
                  Number(value)
                )
              }
            />

            {config.showLegend && (
              <Legend />
            )}

            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="78%"
              paddingAngle={2}
              strokeWidth={1}
            >
              {pieData.map(
                item => (
                  <Cell
                    key={
                      item.name
                    }
                    fill={
                      item.color
                    }
                  />
                )
              )}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (
    config.chartType ===
    "scatter"
  ) {
    if (
      series.length !== 2
    ) {
      return (
        <EmptyChart
          message="Scatter charts require exactly two series."
        />
      );
    }

    const xSeries =
      series[0];

    const ySeries =
      series[1];

    const scatterData =
      modelData.periods
        .map(
          (
            period,
            index
          ) => ({
            period:
              period.name,
            x:
              xSeries.values[
                index
              ],
            y:
              ySeries.values[
                index
              ],
          })
        )
        .filter(
          point =>
            point.x !==
              null &&
            point.y !==
              null
        );

    if (
      scatterData.length ===
      0
    ) {
      return (
        <EmptyChart
          message="There are not enough numeric values to plot this relationship."
        />
      );
    }

    return (
      <div
        className={
          compact
            ? "h-[260px] w-full"
            : "h-[360px] w-full"
        }
      >
        <ResponsiveContainer
          width="100%"
          height={height}
        >
          <ScatterChart>
            {config.showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
            )}

            <XAxis
              type="number"
              dataKey="x"
              name={
                xSeries.sourceName
              }
              tickFormatter={
                formatValue
              }
            />

            <YAxis
              type="number"
              dataKey="y"
              name={
                ySeries.sourceName
              }
              tickFormatter={
                formatValue
              }
            />

            <Tooltip
              cursor={{
                strokeDasharray:
                  "3 3",
              }}
              formatter={(
                value
              ) =>
                formatValue(
                  Number(value)
                )
              }
            />

            <Scatter
              name={`${xSeries.sourceName} vs ${ySeries.sourceName}`}
              data={
                scatterData
              }
              fill={
                xSeries.color
              }
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (
    config.displayMode ===
    "latest"
  ) {
    const latestData =
      series.map(
        item => ({
          name:
            item.scenarioId ===
            "base"
              ? item.sourceName
              : `${item.sourceName} · ${item.scenarioName}`,
          value:
            item.values[
              item.values.length -
                1
            ],
        })
      );

    return (
      <div
        className={
          compact
            ? "h-[260px] w-full"
            : "h-[360px] w-full"
        }
      >
        <ResponsiveContainer
          width="100%"
          height={height}
        >
          <BarChart
            data={latestData}
            margin={{
              top: 12,
              right: 16,
              left: 8,
              bottom: 24,
            }}
          >
            {config.showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />
            )}

            <XAxis
              dataKey="name"
              interval={0}
              angle={
                latestData.length >
                4
                  ? -25
                  : 0
              }
              textAnchor={
                latestData.length >
                4
                  ? "end"
                  : "middle"
              }
              height={
                latestData.length >
                4
                  ? 64
                  : 32
              }
            />

            <YAxis
              tickFormatter={
                formatValue
              }
            />

            <Tooltip
              formatter={(
                value
              ) =>
                value ===
                null
                  ? "—"
                  : formatValue(
                      Number(value)
                    )
              }
            />

            <Bar
              dataKey="value"
              radius={[
                5,
                5,
                0,
                0,
              ]}
            >
              {series.map(
                item => (
                  <Cell
                    key={
                      item.id
                    }
                    fill={
                      item.color
                    }
                  />
                )
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const data =
    buildTimeData(
      modelData,
      series
    );

  if (
    config.chartType ===
    "bar"
  ) {
    return (
      <div
        className={
          compact
            ? "h-[260px] w-full"
            : "h-[360px] w-full"
        }
      >
        <ResponsiveContainer
          width="100%"
          height={height}
        >
          <BarChart
            data={data}
            margin={{
              top: 12,
              right: 16,
              left: 8,
              bottom: 12,
            }}
          >
            {config.showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />
            )}

            <XAxis
              dataKey="period"
            />

            <YAxis
              tickFormatter={
                formatValue
              }
            />

            <Tooltip
              formatter={(
                value
              ) =>
                value ===
                null
                  ? "—"
                  : formatValue(
                      Number(value)
                    )
              }
            />

            {config.showLegend && (
              <Legend />
            )}

            {series.map(
              (
                item,
                index
              ) => (
                <Bar
                  key={
                    item.id
                  }
                  dataKey={`series_${index}`}
                  name={`${item.sourceName} · ${item.scenarioName}`}
                  fill={
                    item.color
                  }
                  radius={[
                    4,
                    4,
                    0,
                    0,
                  ]}
                />
              )
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "h-[260px] w-full"
          : "h-[360px] w-full"
      }
    >
      <ResponsiveContainer
        width="100%"
        height={height}
      >
        <LineChart
          data={data}
          margin={{
            top: 12,
            right: 16,
            left: 8,
            bottom: 12,
          }}
        >
          {config.showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />
          )}

          <XAxis
            dataKey="period"
          />

          <YAxis
            tickFormatter={
              formatValue
            }
          />

          <Tooltip
            formatter={(
              value
            ) =>
              value ===
              null
                ? "—"
                : formatValue(
                    Number(value)
                  )
            }
          />

          {config.showLegend && (
            <Legend />
          )}

          {series.map(
            (
              item,
              index
            ) => (
              <Line
                key={
                  item.id
                }
                type="monotone"
                dataKey={`series_${index}`}
                name={`${item.sourceName} · ${item.scenarioName}`}
                stroke={
                  item.color
                }
                strokeWidth={2.5}
                dot={{
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                }}
                connectNulls={
                  false
                }
              />
            )
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}