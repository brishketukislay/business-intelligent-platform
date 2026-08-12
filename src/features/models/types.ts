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

export const MODEL_TYPE_LABELS: Record<ModelType, string> = {
  COMPANY: "Company",
  PROJECT: "Project",
  INDIVIDUAL: "Individual",
  SALES: "Sales",
  CUSTOMER: "Customer",
  OPERATIONS: "Operations",
  CUSTOM: "Custom",
};

export type PeriodType =
  | "MONTH"
  | "QUARTER"
  | "YEAR";

export type BusinessModelRecord = {
  id: string;
  name: string;
  description: string | null;
  modelType: string;
  status: string;
  createdBy: string;
  createdAt: Date;
  _count?: {
    inputs: number;
    metrics: number;
    periods: number;
  };
};