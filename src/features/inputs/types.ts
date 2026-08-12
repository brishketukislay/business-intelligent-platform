export const INPUT_TYPES = [
  "Number",
  "Currency",
  "Percentage",
  "Text",
] as const;

export type InputType =
  (typeof INPUT_TYPES)[number];

export const INPUT_SCOPES = [
  "MODEL",
  "PERIOD",
  "ITEM",
  "ITEM_PERIOD",
] as const;

export type InputScope =
  (typeof INPUT_SCOPES)[number];

export interface InputDefinitionDto {
  id: string;
  modelId: string;
  name: string;
  key: string;
  type: InputType;
  unit: string | null;
  category: string | null;
  scope: InputScope;
  createdAt: Date;
}

export interface ModelPeriodDto {
  id: string;
  name: string;
  key: string;
  sortOrder: number;
}

export interface PeriodValueDto {
  inputId: string;
  periodId: string;
  value: string;
}