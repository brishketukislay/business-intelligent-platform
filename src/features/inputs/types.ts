export const INPUT_TYPES = [
  "Number",
  "Currency",
  "Percentage",
  "Text",
] as const;


export type InputType =
  (typeof INPUT_TYPES)[number];


export interface InputDefinitionDto {
  id: string;

  modelId: string;

  name: string;

  key: string;

  type: InputType;

  unit: string | null;

  category: string | null;

  createdAt: Date;
}
