export const MODEL_STATUSES = [
  "ACTIVE",
  "INACTIVE",
] as const;

export type ModelStatus =
  (typeof MODEL_STATUSES)[number];


export type BusinessModelRecord = {
  id: string;

  name: string;

  description: string | null;

  status: string;

  createdBy: string;

  createdAt: Date;
};
