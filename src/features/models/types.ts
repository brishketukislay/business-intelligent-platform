export const MODEL_STATUSES = [
  "ACTIVE",
  "INACTIVE",
] as const;

export type ModelStatus =
  (typeof MODEL_STATUSES)[number];

export const MODEL_TYPES = [
  "COMPANY",
  "PROJECT",
  "INDIVIDUAL",
  "SALES",
  "CUSTOMER",
  "OPERATIONS",
  "CUSTOM",
] as const;

export type ModelType =
  (typeof MODEL_TYPES)[number];

export const MODEL_TYPE_LABELS: Record<
  ModelType,
  string
> = {
  COMPANY: "Company",
  PROJECT: "Project",
  INDIVIDUAL: "Individual",
  SALES: "Sales",
  CUSTOMER: "Customer",
  OPERATIONS: "Operations",
  CUSTOM: "Custom",
};

export const MODEL_TYPE_DESCRIPTIONS: Record<
  ModelType,
  string
> = {
  COMPANY:
    "Track the overall performance of a business.",
  PROJECT:
    "Track projects, budgets, delivery and profitability.",
  INDIVIDUAL:
    "Track individual performance, utilisation and contribution.",
  SALES:
    "Track sales activity, pipeline and conversion.",
  CUSTOMER:
    "Track customers, revenue, retention and growth.",
  OPERATIONS:
    "Track operational volume, quality, cost and efficiency.",
  CUSTOM:
    "Create a tracker for anything else that matters.",
};

export type PeriodType =
  | "MONTH"
  | "QUARTER"
  | "YEAR";

export const PERIOD_TYPE_LABELS: Record<
  PeriodType,
  string
> = {
  MONTH: "Monthly",
  QUARTER: "Quarterly",
  YEAR: "Annually",
};

export type BusinessModelRecord = {
  id: string;
  name: string;
  description: string | null;
  modelType: string;
  status: string;
  createdBy: string;
  createdAt: Date;
  itemLabelSingular: string;
  itemLabelPlural: string;
  _count?: {
    inputs: number;
    metrics: number;
    periods: number;
    items: number;
  };
};