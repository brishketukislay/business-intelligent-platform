import {
prisma,
} from "@/lib/prisma";

import type {
MetricDefinitionInput,
} from "../schemas/metric-schema";

export async function getMetricDefinitions(
modelId: string,
userId: string
) {

return prisma.metricDefinition.findMany({

where: {

  modelId,

  model: {
    createdBy: userId,
  },

},

orderBy: {
  createdAt: "desc",
},


});

}

export async function createMetricDefinition(
data: MetricDefinitionInput,
userId: string
) {

const model =
await prisma.businessModel.findFirst({

  where: {

    id: data.modelId,

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

return prisma.metricDefinition.create({

data: {

  modelId:
    data.modelId,

  name:
    data.name,

  key:
    data.key,

  type:
    data.type,

  unit:
    data.unit || null,

  category:
    data.category || null,

  formula:
    data.formula,

},


});

}

export async function updateMetricDefinition(
id: string,
data: MetricDefinitionInput,
userId: string
) {

const metric =
await prisma.metricDefinition.findFirst({

  where: {

    id,

    model: {
      createdBy: userId,
    },

  },

  select: {
    id: true,
  },

});


if (!metric) {

throw new Error(
  "Metric definition not found or access denied."
);


}

return prisma.metricDefinition.update({

where: {
  id,
},

data: {

  name:
    data.name,

  key:
    data.key,

  type:
    data.type,

  unit:
    data.unit || null,

  category:
    data.category || null,

  formula:
    data.formula,

},


});

}

export async function deactivateMetricDefinition(
id: string,
userId: string
) {

const metric =
await prisma.metricDefinition.findFirst({

  where: {

    id,

    model: {
      createdBy: userId,
    },

  },

  select: {
    id: true,
  },

});


if (!metric) {

throw new Error(
  "Metric definition not found or access denied."
);


}

return prisma.metricDefinition.update({

where: {
  id,
},

data: {
  status: "INACTIVE",
},


});

}