import {
  prisma,
} from "@/lib/prisma";

import {
  evaluateFormula,
} from "./formula-engine";


export type CalculatedMetric = {

  id: string;

  name: string;

  key: string;

  type: string;

  unit: string | null;

  category: string | null;

  formula: string;

  value: number | null;

  error: string | null;

};


export async function calculateMetrics(
  modelId: string,
  userId: string
): Promise<CalculatedMetric[]> {

  const model =
    await prisma.businessModel.findFirst({

      where: {

        id: modelId,

        createdBy: userId,

      },

      select: {
        id: true,
      },

    });


  if (!model) {

    throw new Error(
      "Business model not found or access denied."
    );

  }


  const inputs =
    await prisma.inputDefinition.findMany({

      where: {

        modelId,

        status: "ACTIVE",

      },

      select: {

        id: true,

        key: true,

        type: true,

      },

    });


  const workingValues =
    await prisma.workingValue.findMany({

      where: {

        userId,

        input: {
          modelId,
          status: "ACTIVE",
        },

      },

      select: {

        inputId: true,

        value: true,

      },

    });


  const inputById =
    new Map(
      inputs.map(
        (input) => [
          input.id,
          input,
        ]
      )
    );


  const variables:
    Record<string, number> = {};


  for (
    const workingValue
    of workingValues
  ) {

    const input =
      inputById.get(
        workingValue.inputId
      );


    if (!input) {
      continue;
    }


    const value =
      Number(
        workingValue.value
      );


    if (
      Number.isFinite(value)
    ) {

      variables[input.key] =
        value;

    }

  }


  const metrics =
    await prisma.metricDefinition.findMany({

      where: {

        modelId,

        status: "ACTIVE",

      },

      orderBy: {

        createdAt: "asc",

      },

    });


  return metrics.map(
    (metric) => {

      try {

        const value =
          evaluateFormula(
            metric.formula,
            variables
          );


        return {

          id: metric.id,

          name: metric.name,

          key: metric.key,

          type: metric.type,

          unit: metric.unit,

          category:
            metric.category,

          formula:
            metric.formula,

          value,

          error: null,

        };

      } catch (error) {

        return {

          id: metric.id,

          name: metric.name,

          key: metric.key,

          type: metric.type,

          unit: metric.unit,

          category:
            metric.category,

          formula:
            metric.formula,

          value: null,

          error:
            error instanceof Error
              ? error.message
              : "Unable to calculate metric.",

        };

      }

    }
  );

}
export async function calculateSavedModelMetrics(
savedModelId: string,
userId: string
): Promise<CalculatedMetric[]> {

const savedModel =
await prisma.savedModel.findFirst({

  where: {
    id: savedModelId,
    createdBy: userId,
  },

  select: {
    id: true,
    modelId: true,
  },

});


if (!savedModel) {

throw new Error(
  "Saved model not found or access denied."
);


}

const savedValues =
await prisma.savedModelValue.findMany({

  where: {
    savedModelId,
    modelId: savedModel.modelId,
  },

  include: {
    input: {
      select: {
        id: true,
        key: true,
        type: true,
        status: true,
      },
    },
  },

});


const variables:
Record<string, number> = {};

for (
const savedValue
of savedValues
) {

if (
  savedValue.input.status !== "ACTIVE"
) {
  continue;
}


const value =
  Number(
    savedValue.value
  );


if (
  Number.isFinite(value)
) {

  variables[
    savedValue.input.key
  ] = value;

}


}

const metrics =
await prisma.metricDefinition.findMany({

  where: {

    modelId:
      savedModel.modelId,

    status:
      "ACTIVE",

  },

  orderBy: {

    createdAt:
      "asc",

  },

});


return metrics.map(
(metric) => {

  try {

    const value =
      evaluateFormula(
        metric.formula,
        variables
      );


    return {

      id:
        metric.id,

      name:
        metric.name,

      key:
        metric.key,

      type:
        metric.type,

      unit:
        metric.unit,

      category:
        metric.category,

      formula:
        metric.formula,

      value,

      error:
        null,

    };

  } catch (error) {

    return {

      id:
        metric.id,

      name:
        metric.name,

      key:
        metric.key,

      type:
        metric.type,

      unit:
        metric.unit,

      category:
        metric.category,

      formula:
        metric.formula,

      value:
        null,

      error:
        error instanceof Error
          ? error.message
          : "Unable to calculate metric.",

    };

  }

}


);

}