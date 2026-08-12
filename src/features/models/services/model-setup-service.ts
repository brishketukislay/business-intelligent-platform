import { prisma } from "@/lib/prisma";

import type {
  ModelType,
  PeriodType,
} from "../types";

import {
  getTrackerTemplate,
} from "./tracker-template-service";

type CreateTrackerData = {
  name: string;
  description?: string;
  modelType: ModelType;
  periodType: PeriodType;
  fiscalYearStartMonth: number;
  currency: string;
  inputKeys: string[];
  metricKeys: string[];
};

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

function generatePeriods(
  periodType: PeriodType,
  fiscalYearStartMonth: number,
) {
  const year = new Date().getUTCFullYear();

  const start = new Date(
    Date.UTC(
      year,
      fiscalYearStartMonth - 1,
      1,
    ),
  );

  const count =
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
    { length: count },
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

      if (periodType === "MONTH") {
        name = periodStart.toLocaleString(
          "en-GB",
          {
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          },
        );
      } else if (periodType === "QUARTER") {
        const quarter =
          Math.floor(
            periodStart.getUTCMonth() / 3,
          ) + 1;

        name = `Q${quarter} ${periodStart.getUTCFullYear()}`;
      } else {
        name = `${periodStart.getUTCFullYear()}`;
      }

      return {
        name,
        key: `${periodStart.getUTCFullYear()}-${String(
          index + 1,
        ).padStart(2, "0")}`,
        startDate: periodStart,
        endDate: periodEnd,
        sortOrder: index,
        status: "ACTIVE",
      };
    },
  );
}

export async function createTracker(
  userId: string,
  data: CreateTrackerData,
) {
  const template =
    getTrackerTemplate(
      data.modelType,
    );

  const selectedInputs =
    template.inputs.filter((input) =>
      data.inputKeys.includes(input.key),
    );

  const selectedMetrics =
    template.metrics.filter((metric) =>
      data.metricKeys.includes(metric.key),
    );

  return prisma.$transaction(
    async (tx) => {
      const model =
        await tx.businessModel.create({
          data: {
            name: data.name,
            description:
              data.description ||
              template.description,
            modelType: data.modelType,
            status: "ACTIVE",
            createdBy: userId,
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

      const periods =
        generatePeriods(
          data.periodType,
          data.fiscalYearStartMonth,
        );

      await tx.modelPeriod.createMany({
        data: periods.map((period) => ({
          ...period,
          modelId: model.id,
        })),
      });

      if (selectedInputs.length) {
        await tx.inputDefinition.createMany({
          data: selectedInputs.map(
            (input) => ({
              modelId: model.id,
              name: input.name,
              key: input.key,
              type: input.type,
              unit:
                input.unit ?? null,
              category:
                input.category ?? null,
              scope: input.scope,
              status: "ACTIVE",
            }),
          ),
        });
      }

      if (selectedMetrics.length) {
        await tx.metricDefinition.createMany({
          data: selectedMetrics.map(
            (metric) => ({
              modelId: model.id,
              name: metric.name,
              key: metric.key,
              type: metric.type,
              unit:
                metric.unit ?? null,
              category:
                metric.category ?? null,
              formula: metric.formula,
              scope: "PERIOD",
              status: "ACTIVE",
            }),
          ),
        });
      }

      return model;
    },
  );
}