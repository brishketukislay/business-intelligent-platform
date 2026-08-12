"use server";

import {
revalidatePath,
} from "next/cache";

import {
z,
} from "zod";

import {
requireCurrentUser,
} from "@/lib/current-user";

import {
prisma,
} from "@/lib/prisma";

import {
requireModelAccess,
} from "@/lib/model-access";

import {
ANALYTICS_CHART_TYPES,
ANALYTICS_DISPLAY_MODES,
type AnalyticsChartConfig,
} from "../types";

const seriesSchema =
z.object({
id:
z.string()
.min(1)
.max(100),

sourceKey:
  z.string()
    .min(1)
    .max(200),

scenarioId:
  z.string()
    .min(1)
    .max(100),

/**
 * Optional in the UI.
 *
 * Empty strings are deliberately accepted.
 * The chart renderer falls back to the source/scenario
 * name when this is empty.
 */
label:
  z.string()
    .trim()
    .max(100)
    .default(""),

color:
  z.string()
    .regex(
      /^#[0-9a-fA-F]{6}$/,
      "Colour must be a six-digit hex colour."
    ),

});

const configSchema =
z.object({
title:
z.string()
.trim()
.min(1)
.max(100),

chartType:
  z.enum(
    ANALYTICS_CHART_TYPES
  ),

displayMode:
  z.enum(
    ANALYTICS_DISPLAY_MODES
  ),

series:
  z.array(
    seriesSchema
  )
    .min(1)
    .max(6),

showLegend:
  z.boolean(),

showGrid:
  z.boolean(),

showValues:
  z.boolean(),

width:
  z.number()
    .int()
    .min(320)
    .max(1400)
    .optional()
    .default(560),

height:
  z.number()
    .int()
    .min(280)
    .max(900)
    .optional()
    .default(360),

isVisible:
  z.boolean()
    .optional()
    .default(true),
});

const saveSchema =
z.object({
modelId:
z.string()
.min(1),
name:
  z.string()
    .trim()
    .min(1)
    .max(100),

config:
  configSchema,
});

const layoutSchema =
z.object({
width:
z.number()
.int()
.min(320)
.max(1400),
height:
  z.number()
    .int()
    .min(280)
    .max(900),

});

async function validateConfigSources(
  modelId: string,
  config: AnalyticsChartConfig
) {
  const [
    inputs,
    metrics,
    scenarios,
  ] = await Promise.all([
    prisma.inputDefinition.findMany({
      where: {
        modelId,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    }),

    prisma.metricDefinition.findMany({
      where: {
        modelId,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    }),

    prisma.scenario.findMany({
      where: {
        modelId,
      },
      select: {
        id: true,
      },
    }),
  ]);

  const validSources =
    new Set([
      ...inputs.map(
        (input) =>
          `input:${input.id}`
      ),

      ...metrics.map(
        (metric) =>
          `metric:${metric.id}`
      ),
    ]);

  const validScenarioIds =
    new Set([
      "base",
      ...scenarios.map(
        (scenario) =>
          scenario.id
      ),
    ]);

  for (const series of config.series) {
    if (
      !validSources.has(
        series.sourceKey
      )
    ) {
      throw new Error(
        "One or more selected analytics sources are no longer available."
      );
    }

    if (
      !validScenarioIds.has(
        series.scenarioId
      )
    ) {
      throw new Error(
        "One or more selected analytics scenarios are no longer available."
      );
    }
  }

  if (
    config.chartType === "scatter" &&
    config.series.length !== 2
  ) {
    throw new Error(
      "Scatter charts require exactly two data series."
    );
  }

  if (
    config.chartType === "pie" &&
    config.displayMode !== "latest"
  ) {
    throw new Error(
      "Pie charts use the latest period."
    );
  }
}

export async function saveAnalyticsChartAction(
input: unknown
) {
const user =
await requireCurrentUser();

const parsed =
saveSchema.safeParse(
input
);

if (!parsed.success) {
console.error(
"Invalid analytics configuration:",
parsed.error.flatten()
);

return {
  success: false,
  error:
    parsed.error.issues
      .map(
        issue =>
          `${issue.path.join(".") || "config"}: ${issue.message}`
      )
      .join("; "),
};

}

try {
await requireModelAccess(
parsed.data.modelId,
user.id
);


await validateConfigSources(
  parsed.data.modelId,
  parsed.data.config
);

await prisma.analyticsChart.create({
  data: {
    modelId:
      parsed.data.modelId,

    createdBy:
      user.id,

    name:
      parsed.data.name,

    config:
      JSON.stringify(
        parsed.data.config
      ),
  },
});

revalidatePath(
  "/dashboard"
);

return {
  success: true,
};

} catch (error) {
console.error(
"Failed to save analytics chart:",
error
);

return {
  success: false,
  error:
    error instanceof Error
      ? error.message
      : "Unable to save analytics chart.",
};

}
}

export async function updateAnalyticsChartAction(
chartId: string,
input: unknown
) {
const user =
await requireCurrentUser();

const parsed =
saveSchema.safeParse(
input
);

if (!parsed.success) {
console.error(
"Invalid analytics configuration:",
parsed.error.flatten()
);

return {
  success: false,
  error:
    parsed.error.issues
      .map(
        issue =>
          `${issue.path.join(".") || "config"}: ${issue.message}`
      )
      .join("; "),
};

}

try {
const chart =
await prisma.analyticsChart.findUnique({
where: {
id: chartId,
},
    select: {
      id: true,
      modelId: true,
      createdBy: true,
    },
  });

if (!chart) {
  throw new Error(
    "Analytics chart not found."
  );
}

if (
  chart.createdBy !==
  user.id
) {
  throw new Error(
    "You do not own this analytics chart."
  );
}

if (
  chart.modelId !==
  parsed.data.modelId
) {
  throw new Error(
    "Chart model cannot be changed."
  );
}

await requireModelAccess(
  chart.modelId,
  user.id
);

await validateConfigSources(
  chart.modelId,
  parsed.data.config
);

await prisma.analyticsChart.update({
  where: {
    id: chart.id,
  },

  data: {
    name:
      parsed.data.name,

    config:
      JSON.stringify(
        parsed.data.config
      ),
  },
});

revalidatePath(
  "/dashboard"
);

return {
  success: true,
};

} catch (error) {
console.error(
"Failed to update analytics chart:",
error
);

return {
  success: false,
  error:
    error instanceof Error
      ? error.message
      : "Unable to update analytics chart.",
};

}
}

export async function updateAnalyticsChartLayoutAction(
chartId: string,
input: unknown
) {
const user =
await requireCurrentUser();

const parsed =
layoutSchema.safeParse(
input
);

if (!parsed.success) {
return {
success: false,
error:
"Invalid chart dimensions.",
};
}

try {
const chart =
await prisma.analyticsChart.findUnique({
where: {
id: chartId,
},

    select: {
      id: true,
      createdBy: true,
      config: true,
    },
  });

if (!chart) {
  throw new Error(
    "Analytics chart not found."
  );
}

if (
  chart.createdBy !==
  user.id
) {
  throw new Error(
    "You do not own this analytics chart."
  );
}

const existing =
  JSON.parse(
    chart.config
  ) as AnalyticsChartConfig;

const nextConfig = {
  ...existing,
  width:
    parsed.data.width,
  height:
    parsed.data.height,
};

await prisma.analyticsChart.update({
  where: {
    id: chart.id,
  },

  data: {
    config:
      JSON.stringify(
        nextConfig
      ),
  },
});

revalidatePath(
  "/dashboard"
);

return {
  success: true,
};

} catch (error) {
console.error(
"Failed to update analytics chart layout:",
error
);
return {
  success: false,
  error:
    error instanceof Error
      ? error.message
      : "Unable to resize analytics chart.",
};

}
}

export async function setAnalyticsChartVisibilityAction(
chartId: string,
isVisible: boolean
) {
const user =
await requireCurrentUser();

try {
const chart =
await prisma.analyticsChart.findUnique({
where: {
id: chartId,
},

    select: {
      id: true,
      createdBy: true,
      config: true,
    },
  });

if (!chart) {
  throw new Error(
    "Analytics chart not found."
  );
}

if (
  chart.createdBy !==
  user.id
) {
  throw new Error(
    "You do not own this analytics chart."
  );
}

const existing =
  JSON.parse(
    chart.config
  ) as AnalyticsChartConfig;

await prisma.analyticsChart.update({
  where: {
    id: chart.id,
  },

  data: {
    config:
      JSON.stringify({
        ...existing,
        isVisible,
      }),
  },
});

revalidatePath(
  "/dashboard"
);

return {
  success: true,
};

} catch (error) {
console.error(
"Failed to update analytics chart visibility:",
error
);

return {
  success: false,
  error:
    error instanceof Error
      ? error.message
      : "Unable to update analytics chart visibility.",
};

}
}

export async function deleteAnalyticsChartAction(
chartId: string
) {
const user =
await requireCurrentUser();

try {
const chart =
await prisma.analyticsChart.findUnique({
where: {
id: chartId,
},

    select: {
      id: true,
      createdBy: true,
    },
  });

if (!chart) {
  return {
    success: true,
  };
}

if (
  chart.createdBy !==
  user.id
) {
  throw new Error(
    "You do not own this analytics chart."
  );
}

await prisma.analyticsChart.delete({
  where: {
    id: chart.id,
  },
});

revalidatePath(
  "/dashboard"
);

return {
  success: true,
};

} catch (error) {
console.error(
"Failed to delete analytics chart:",
error
);
return {
  success: false,
  error:
    error instanceof Error
      ? error.message
      : "Unable to delete analytics chart.",
};
}
}