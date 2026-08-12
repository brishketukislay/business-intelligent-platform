"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  createModelItemAction,
  upsertModelItemValueAction,
} from "./model-item-actions";

type DashboardData = {
  model: {
    id: string;
    name: string;
    itemLabelSingular: string;
    itemLabelPlural: string;
  };

  items: Array<{
    id: string;
    name: string;
    key: string;
  }>;

  inputs: Array<{
    id: string;
    name: string;
    key: string;
    type: string;
    unit: string | null;
    category: string | null;
    scope: string;
  }>;

  metrics: Array<{
    id: string;
    name: string;
    key: string;
    type: string;
    unit: string | null;
    formula: string;
  }>;

  periods: Array<{
    id: string;
    name: string;
    key: string;
  }>;

  itemValues: Array<{
    itemId: string;
    inputId: string;
    periodId: string | null;
    value: string;
  }>;

  itemSeries: Array<{
    item: {
      id: string;
      name: string;
      key: string;
    };
    metrics: Array<{
      metricId: string;
      key: string;
      name: string;
      type: string;
      unit: string | null;
      values: Array<number | null>;
    }>;
  }>;

  portfolioMetrics: Array<{
    metricId: string;
    key: string;
    name: string;
    type: string;
    unit: string | null;
    values: Array<number | null>;
  }>;
};

function formatNumber(
  value: number | null
) {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-GB",
    {
      maximumFractionDigits: 2,
    }
  ).format(value);
}

function formatMetric(
  value: number | null,
  type: string
) {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  if (type === "Currency") {
    return new Intl.NumberFormat(
      "en-GB",
      {
        style: "currency",
        currency: "GBP",
        maximumFractionDigits: 0,
      }
    ).format(value);
  }

  if (type === "Percentage") {
    return `${value.toFixed(1)}%`;
  }

  return formatNumber(value);
}

export function ModelItemsDashboard({
  data,
}: {
  data: DashboardData;
}) {
  const [
    newItemName,
    setNewItemName,
  ] = useState("");

  const [
    savingKey,
    setSavingKey,
  ] = useState<string | null>(
    null
  );

  const [
    selectedMetric,
    setSelectedMetric,
  ] = useState(() => {
    const preferred =
      data.metrics.find(
        metric =>
          metric.key ===
          "profit"
      );

    return (
      preferred?.id ??
      data.metrics[0]?.id ??
      ""
    );
  });

  const valueMap =
    useMemo(() => {
      const map =
        new Map<string, string>();

      for (
        const value of
        data.itemValues
      ) {
        map.set(
          [
            value.itemId,
            value.inputId,
            value.periodId ?? "scalar",
          ].join(":"),
          value.value
        );
      }

      return map;
    }, [data.itemValues]);

  const itemInputs =
    data.inputs.filter(
      input =>
        input.scope === "ITEM" ||
        input.scope === "ITEM_PERIOD"
    );

  const itemLevelInputs =
    itemInputs.filter(
      input =>
        input.scope === "ITEM"
    );

  const periodInputs =
    itemInputs.filter(
      input =>
        input.scope ===
        "ITEM_PERIOD"
    );

  const metric =
    data.metrics.find(
      item =>
        item.id ===
        selectedMetric
    );

  async function addItem() {
    if (!newItemName.trim()) {
      return;
    }

    const result =
      await createModelItemAction(
        data.model.id,
        newItemName
      );

    if (result.success) {
      setNewItemName("");
      window.location.reload();
    }
  }

  async function saveValue(
    itemId: string,
    inputId: string,
    periodId: string | null,
    value: string
  ) {
    const key = [
      itemId,
      inputId,
      periodId ?? "scalar",
    ].join(":");

    setSavingKey(key);

    try {
      const result =
        await upsertModelItemValueAction(
          data.model.id,
          itemId,
          inputId,
          periodId,
          value
        );

      if (!result.success) {
        alert(result.error);
      }
    } finally {
      setSavingKey(null);
    }
  }

const portfolioData =
  data.periods.map(
    (period, index) => ({
      period: period.name,
      value: null,
    })
  );

  const portfolioSeries =
    data.periods.map(
      (period, index) => ({
        period: period.name,
        value:
          metric?.id
            ? data.portfolioMetrics.find(
                item =>
                  item.metricId ===
                  metric.id
              )?.values[index] ??
              null
            : null,
      })
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-xl border bg-background p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Tracking
          </p>

          <h1 className="text-2xl font-semibold">
            {data.model.itemLabelPlural}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage items, period values and
            calculated performance from one model.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            value={newItemName}
            onChange={event =>
              setNewItemName(
                event.target.value
              )
            }
            placeholder={`New ${data.model.itemLabelSingular}`}
            onKeyDown={event => {
              if (event.key === "Enter") {
                void addItem();
              }
            }}
          />

          <Button
            onClick={() => void addItem()}
          >
            Add
          </Button>
        </div>
      </div>

      {itemInputs.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              {data.model.itemLabelPlural}
            </h2>

            <p className="text-sm text-muted-foreground">
              Item-level assumptions and
              period-based actuals.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="min-w-[1100px] w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="sticky left-0 z-10 bg-muted/40 px-4 py-3 text-left">
                    {data.model.itemLabelSingular}
                  </th>

                  {itemLevelInputs.map(
                    input => (
                      <th
                        key={input.id}
                        className="px-4 py-3 text-left"
                      >
                        {input.name}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {data.items.map(
                  item => (
                    <tr
                      key={item.id}
                      className="border-b last:border-0"
                    >
                      <td className="sticky left-0 bg-background px-4 py-3 font-medium">
                        {item.name}
                      </td>

                      {itemLevelInputs.map(
                        input => {
                          const key = [
                            item.id,
                            input.id,
                            "scalar",
                          ].join(":");

                          return (
                            <td
                              key={input.id}
                              className="px-4 py-3"
                            >
                              <Input
                                type={
                                  input.type ===
                                    "Text"
                                    ? "text"
                                    : "number"
                                }
                                step={
                                  input.type ===
                                  "Text"
                                    ? undefined
                                    : "any"
                                }
                                defaultValue={
                                  valueMap.get(
                                    key
                                  ) ?? ""
                                }
                                disabled={
                                  savingKey ===
                                  key
                                }
                                onBlur={event =>
                                  void saveValue(
                                    item.id,
                                    input.id,
                                    null,
                                    event.target
                                      .value
                                  )
                                }
                                className="min-w-[130px]"
                              />
                            </td>
                          );
                        }
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {periodInputs.length > 0 &&
            data.periods.length > 0 && (
              <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-[1200px] w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="sticky left-0 z-10 bg-muted/40 px-4 py-3 text-left">
                        Item / Input
                      </th>

                      {data.periods.map(
                        period => (
                          <th
                            key={period.id}
                            className="px-4 py-3 text-center"
                          >
                            {period.name}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {data.items.flatMap(
                      item =>
                        periodInputs.map(
                          input => (
                            <tr
                              key={`${item.id}:${input.id}`}
                              className="border-b last:border-0"
                            >
                              <td className="sticky left-0 bg-background px-4 py-3">
                                <div className="font-medium">
                                  {item.name}
                                </div>

                                <div className="text-xs text-muted-foreground">
                                  {input.name}
                                </div>
                              </td>

                              {data.periods.map(
                                period => {
                                  const key = [
                                    item.id,
                                    input.id,
                                    period.id,
                                  ].join(":");

                                  return (
                                    <td
                                      key={
                                        period.id
                                      }
                                      className="px-3 py-2"
                                    >
                                      <Input
                                        type="number"
                                        step="any"
                                        defaultValue={
                                          valueMap.get(
                                            key
                                          ) ?? ""
                                        }
                                        disabled={
                                          savingKey ===
                                          key
                                        }
                                        onBlur={event =>
                                          void saveValue(
                                            item.id,
                                            input.id,
                                            period.id,
                                            event.target
                                              .value
                                          )
                                        }
                                        className="min-w-[90px]"
                                      />
                                    </td>
                                  );
                                }
                              )}
                            </tr>
                          )
                        )
                    )}
                  </tbody>
                </table>
              </div>
            )}
        </section>
      )}

      {data.metrics.length > 0 && (
        <>
          <section className="rounded-xl border bg-background p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Performance
                </h2>

                <p className="text-sm text-muted-foreground">
                  The same metric can be viewed per
                  item or across the complete portfolio.
                </p>
              </div>

              <select
                value={selectedMetric}
                onChange={event =>
                  setSelectedMetric(
                    event.target.value
                  )
                }
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                {data.metrics.map(
                  item => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  )
                )}
              </select>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            {data.itemSeries.map(
              item => {
                const series =
                  item.metrics.find(
                    metricItem =>
                      metricItem.metricId ===
                      selectedMetric
                  );

                const chartData =
                  data.periods.map(
                    (
                      period,
                      index
                    ) => ({
                      period:
                        period.name,
                      value:
                        series?.values[
                          index
                        ] ?? null,
                    })
                  );

                return (
                  <section
                    key={item.item.id}
                    className="rounded-xl border bg-background p-5"
                  >
                    <div className="mb-4">
                      <h3 className="font-semibold">
                        {item.item.name}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        {metric?.name}
                      </p>
                    </div>

                    <div className="h-[280px]">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <LineChart
                          data={chartData}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="period"
                          />

                          <YAxis />

                          <Tooltip
                            formatter={value =>
                              formatMetric(
                                Number(value),
                                metric?.type ??
                                  "Number"
                              )
                            }
                          />

                          <Line
                            type="monotone"
                            dataKey="value"
                            name={
                              metric?.name
                            }
                            stroke="#2563eb"
                            strokeWidth={2.5}
                            dot={{ r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                );
              }
            )}
          </div>

          <section className="rounded-xl border bg-background p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                Overall {data.model.itemLabelPlural}
              </h2>

              <p className="text-sm text-muted-foreground">
                Aggregated across every active item.
              </p>
            </div>

            <div className="h-[380px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={portfolioSeries}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="period"
                  />

                  <YAxis />

                  <Tooltip
                    formatter={value =>
                      formatMetric(
                        Number(value),
                        metric?.type ??
                          "Number"
                      )
                    }
                  />

                  <Legend />

                  <Bar
                    dataKey="value"
                    name={
                      metric?.name ??
                      "Metric"
                    }
                    fill="#16a34a"
                    radius={[
                      4,
                      4,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}

      {data.metrics.length === 0 && (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <h2 className="font-semibold">
            No metrics configured
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Add calculated metrics to this model
            to see item and portfolio analytics.
          </p>
        </div>
      )}
    </div>
  );
}