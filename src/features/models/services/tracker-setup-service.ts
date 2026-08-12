import { prisma } from "@/lib/prisma";
import { generateUniqueKey } from "@/lib/key-utils";

import {
  getTrackerTemplate,
} from "./tracker-template-service";

import type {
  ModelType,
  PeriodType,
} from "../types";

import type {
  InputType,
  InputScope,
} from "@/features/inputs/types";

type CreateTrackerInput = {
  name: string;
  description?: string;

  modelType: ModelType;

  periodType: PeriodType;
  fiscalYearStartMonth: number;
  currency: string;

  inputKeys: string[];
  metricKeys: string[];

  customInputs: Array<{
    name: string;
    type: InputType;
    scope: InputScope;
    unit?: string;
    category?: string;
  }>;
};

function getFiscalYearStart(
  fiscalYearStartMonth: number,
) {
  const now = new Date();

  const currentMonth = now.getMonth() + 1;

  const year =
    currentMonth >= fiscalYearStartMonth
      ? now.getFullYear()
      : now.getFullYear() - 1;

  return new Date(
    Date.UTC(
      year,
      fiscalYearStartMonth - 1,
      1,
    ),
  );
}

function addMonths(
  date: Date,
  months: number,
) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + months,
      1,
    ),
  );
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function generatePeriods(
  periodType: PeriodType,
  fiscalYearStartMonth: number,
) {
  const start = getFiscalYearStart(
    fiscalYearStartMonth,
  );

  const periodCount =
    periodType === "MONTH"
      ? 12
      : periodType === "QUARTER"
        ? 4
        : 1;

  const monthsPerPeriod =
    periodType === "MONTH"
      ? 1
      : periodType === "QUARTER"
        ? 3
        : 12;

  return Array.from(
    {
      length: periodCount,
    },
    (_, index) => {
      const periodStart = addMonths(
        start,
        index * monthsPerPeriod,
      );

      const periodEnd = new Date(
        Date.UTC(
          periodStart.getUTCFullYear(),
          periodStart.getUTCMonth() +
            monthsPerPeriod,
          0,
          23,
          59,
          59,
          999,
        ),
      );

      let name: string;
      let key: string;

      if (periodType === "MONTH") {
        name = formatMonth(periodStart);

        key = [
          periodStart.getUTCFullYear(),
          String(
            periodStart.getUTCMonth() + 1,
          ).padStart(2, "0"),
        ].join("-");
      } else if (periodType === "QUARTER") {
        const quarter =
          Math.floor(
            periodStart.getUTCMonth() / 3,
          ) + 1;

        name = `Q${quarter} ${periodStart.getUTCFullYear()}`;

        key = `${periodStart.getUTCFullYear()}-Q${quarter}`;
      } else {
        name = `${periodStart.getUTCFullYear()}/${periodEnd.getUTCFullYear()}`;

        key = `FY${periodStart.getUTCFullYear()}`;
      }

      return {
        name,
        key,
        startDate: periodStart,
        endDate: periodEnd,
        sortOrder: index,
        status: "ACTIVE" as const,
      };
    },
  );
}

function materializeUnit(
  unit: string | undefined,
  currency: string,
) {
  if (unit === "CURRENCY") {
    return currency;
  }

  return unit ?? null;
}

export async function createTracker(
  userId: string,
  data: CreateTrackerInput,
) {
  const template = getTrackerTemplate(
    data.modelType,
  );

  if (!template) {
    throw new Error(
      `Unsupported tracker type: ${data.modelType}`,
    );
  }

  const templateInputMap = new Map(
    template.inputs.map((input) => [
      input.key,
      input,
    ]),
  );

  const templateMetricMap = new Map(
    template.metrics.map((metric) => [
      metric.key,
      metric,
    ]),
  );

  const selectedInputs = data.inputKeys
    .map((key) => templateInputMap.get(key))
    .filter(
      (
        input,
      ): input is NonNullable<typeof input> =>
        Boolean(input),
    );

  const selectedMetrics = data.metricKeys
    .map((key) => templateMetricMap.get(key))
    .filter(
      (
        metric,
      ): metric is NonNullable<typeof metric> =>
        Boolean(metric),
    );

  /*
   * A metric can only be created when all of its
   * required inputs have also been selected.
   */
  const selectedInputKeys = new Set(
    selectedInputs.map((input) => input.key),
  );

  for (const metric of selectedMetrics) {
    const missing = metric.requires.filter(
      (key) =>
        !selectedInputKeys.has(key),
    );

    if (missing.length > 0) {
      throw new Error(
        `The calculation "${metric.name}" requires: ${missing.join(
          ", ",
        )}.`,
      );
    }
  }

  /*
   * Generate safe keys for custom inputs.
   */
  const usedKeys = new Set([
    ...template.inputs.map(
      (input) => input.key,
    ),
    ...template.metrics.map(
      (metric) => metric.key,
    ),
  ]);

  const customInputs =
    data.customInputs.map((input) => {
      const key = generateUniqueKey(
        input.name,
        Array.from(usedKeys),
      );

      usedKeys.add(key);

      return {
        ...input,
        key,
      };
    });

  return prisma.$transaction(async (tx) => {
    const model =
      await tx.businessModel.create({
        data: {
          name: data.name.trim(),

          description:
            data.description?.trim() ||
            template.description,

          modelType: data.modelType,

          status: "ACTIVE",

          createdBy: userId,

          itemLabelSingular:
            template.itemLabelSingular,

          itemLabelPlural:
            template.itemLabelPlural,
        },
      });

    await tx.businessModelSettings.create({
      data: {
        modelId: model.id,
        currency: data.currency,
        fiscalYearStartMonth:
          data.fiscalYearStartMonth,
        periodType: data.periodType,
      },
    });

    const periods = generatePeriods(
      data.periodType,
      data.fiscalYearStartMonth,
    );

    await tx.modelPeriod.createMany({
      data: periods.map((period) => ({
        ...period,
        modelId: model.id,
      })),
    });

    const allInputs = [
      ...selectedInputs.map((input) => ({
        modelId: model.id,
        name: input.name,
        key: input.key,
        type: input.type,
        scope: input.scope,
        unit: materializeUnit(
          input.unit,
          data.currency,
        ),
        category: input.category,
        description: input.description,
        status: "ACTIVE" as const,
        isRequired: false,
      })),

      ...customInputs.map((input) => ({
        modelId: model.id,
        name: input.name,
        key: input.key,
        type: input.type,
        scope: input.scope,
        unit: materializeUnit(
          input.unit,
          data.currency,
        ),
        category:
          input.category || null,
        description: null,
        status: "ACTIVE" as const,
        isRequired: false,
      })),
    ];

    if (allInputs.length > 0) {
      await tx.inputDefinition.createMany({
        data: allInputs,
      });
    }

    if (selectedMetrics.length > 0) {
      await tx.metricDefinition.createMany({
        data: selectedMetrics.map(
          (metric) => ({
            modelId: model.id,
            name: metric.name,
            key: metric.key,
            type: metric.type,
            unit: materializeUnit(
              metric.unit,
              data.currency,
            ),
            category: metric.category,
            formula: metric.formula,
            scope: "PERIOD",
            status: "ACTIVE" as const,
          }),
        ),
      });
    }

    return model;
  });
}