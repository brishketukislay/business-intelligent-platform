
import type {
  ModelType,
  PeriodType,
} from "../types";

import type {
  InputScope,
  InputType,
} from "@/features/inputs/types";

type TrackerInputTemplate = {
  key: string;
  name: string;
  description: string;
  type: InputType;
  scope: InputScope;
  unit?: string;
  category: string;
  recommended?: boolean;
};

type TrackerMetricTemplate = {
  key: string;
  name: string;
  description: string;
  type: "Number" | "Currency" | "Percentage";
  unit?: string;
  category: string;
  formula: string;
  requires: string[];
  recommended?: boolean;
};

export type TrackerTemplate = {
  type: ModelType;
  name: string;
  description: string;

  itemLabelSingular: string;
  itemLabelPlural: string;

  usesItems: boolean;

  recommendedPeriodType: PeriodType;

  inputs: TrackerInputTemplate[];
  metrics: TrackerMetricTemplate[];
};

const companyTemplate: TrackerTemplate = {
  type: "COMPANY",
  name: "Company performance",
  description:
    "Track revenue, costs, profitability, people and cash across the business.",

  itemLabelSingular: "Department",
  itemLabelPlural: "Departments",

  usesItems: false,

  recommendedPeriodType: "MONTH",

  inputs: [
    {
      key: "revenue",
      name: "Revenue",
      description:
        "Money generated during the period.",
      type: "Currency",
      scope: "PERIOD",
      unit: "CURRENCY",
      category: "Financial",
      recommended: true,
    },
    {
      key: "cogs",
      name: "Cost of goods sold",
      description:
        "Direct costs associated with revenue.",
      type: "Currency",
      scope: "PERIOD",
      unit: "CURRENCY",
      category: "Costs",
      recommended: true,
    },
    {
      key: "operating_expenses",
      name: "Operating expenses",
      description:
        "Other operating costs for the period.",
      type: "Currency",
      scope: "PERIOD",
      unit: "CURRENCY",
      category: "Costs",
      recommended: true,
    },
    {
      key: "headcount",
      name: "Headcount",
      description:
        "Number of people in the business.",
      type: "Number",
      scope: "MODEL",
      unit: "people",
      category: "People",
      recommended: true,
    },
    {
      key: "cash_balance",
      name: "Cash balance",
      description:
        "Current cash position.",
      type: "Currency",
      scope: "MODEL",
      unit: "CURRENCY",
      category: "Cash",
      recommended: false,
    },
  ],

  metrics: [
    {
      key: "gross_profit",
      name: "Gross profit",
      description:
        "Revenue after direct costs.",
      type: "Currency",
      unit: "CURRENCY",
      category: "Profitability",
      formula: "revenue - cogs",
      requires: [
        "revenue",
        "cogs",
      ],
      recommended: true,
    },
    {
      key: "gross_margin",
      name: "Gross margin",
      description:
        "Gross profit as a percentage of revenue.",
      type: "Percentage",
      unit: "%",
      category: "Profitability",
      formula:
        "(revenue - cogs) / revenue * 100",
      requires: [
        "revenue",
        "cogs",
      ],
      recommended: true,
    },
    {
      key: "operating_profit",
      name: "Operating profit",
      description:
        "Profit after direct and operating costs.",
      type: "Currency",
      unit: "CURRENCY",
      category: "Profitability",
      formula:
        "revenue - cogs - operating_expenses",
      requires: [
        "revenue",
        "cogs",
        "operating_expenses",
      ],
      recommended: true,
    },
    {
      key: "operating_margin",
      name: "Operating margin",
      description:
        "Operating profit as a percentage of revenue.",
      type: "Percentage",
      unit: "%",
      category: "Profitability",
      formula:
        "(revenue - cogs - operating_expenses) / revenue * 100",
      requires: [
        "revenue",
        "cogs",
        "operating_expenses",
      ],
      recommended: true,
    },
  ],
};

const projectTemplate: TrackerTemplate = {
  type: "PROJECT",
  name: "Project performance",
  description:
    "Track project delivery, effort, budget and profitability.",

  itemLabelSingular: "Project",
  itemLabelPlural: "Projects",

  usesItems: true,

  recommendedPeriodType: "MONTH",

  inputs: [
    {
      key: "budget",
      name: "Budget",
      description:
        "Approved budget for the project.",
      type: "Currency",
      scope: "ITEM",
      unit: "CURRENCY",
      category: "Financial",
      recommended: true,
    },
    {
      key: "revenue",
      name: "Revenue",
      description:
        "Revenue recognised during the period.",
      type: "Currency",
      scope: "ITEM_PERIOD",
      unit: "CURRENCY",
      category: "Financial",
      recommended: true,
    },
    {
      key: "project_cost",
      name: "Project cost",
      description:
        "Actual project cost during the period.",
      type: "Currency",
      scope: "ITEM_PERIOD",
      unit: "CURRENCY",
      category: "Financial",
      recommended: true,
    },
    {
      key: "hours_worked",
      name: "Hours worked",
      description:
        "Hours spent during the period.",
      type: "Number",
      scope: "ITEM_PERIOD",
      unit: "hours",
      category: "Delivery",
      recommended: true,
    },
    {
      key: "completion",
      name: "Completion",
      description:
        "Estimated percentage of work completed.",
      type: "Percentage",
      scope: "ITEM_PERIOD",
      unit: "%",
      category: "Delivery",
      recommended: true,
    },
    {
      key: "issues",
      name: "Issues",
      description:
        "Number of open or raised issues.",
      type: "Number",
      scope: "ITEM_PERIOD",
      unit: "issues",
      category: "Delivery",
      recommended: false,
    },
  ],

  metrics: [
    {
      key: "project_profit",
      name: "Project profit",
      description:
        "Revenue minus project cost.",
      type: "Currency",
      unit: "CURRENCY",
      category: "Financial",
      formula:
        "revenue - project_cost",
      requires: [
        "revenue",
        "project_cost",
      ],
      recommended: true,
    },
    {
      key: "project_margin",
      name: "Project margin",
      description:
        "Project profit as a percentage of revenue.",
      type: "Percentage",
      unit: "%",
      category: "Financial",
      formula:
        "(revenue - project_cost) / revenue * 100",
      requires: [
        "revenue",
        "project_cost",
      ],
      recommended: true,
    },
    {
      key: "budget_variance",
      name: "Budget remaining",
      description:
        "Budget remaining after project costs.",
      type: "Currency",
      unit: "CURRENCY",
      category: "Financial",
      formula:
        "budget - project_cost",
      requires: [
        "budget",
        "project_cost",
      ],
      recommended: true,
    },
  ],
};

const individualTemplate: TrackerTemplate = {
  type: "INDIVIDUAL",
  name: "Individual performance",
  description:
    "Track utilisation, output and financial contribution.",

  itemLabelSingular: "Person",
  itemLabelPlural: "People",

  usesItems: true,

  recommendedPeriodType: "MONTH",

  inputs: [
    {
      key: "available_hours",
      name: "Available hours",
      description:
        "Working hours available during the period.",
      type: "Number",
      scope: "ITEM_PERIOD",
      unit: "hours",
      category: "Capacity",
      recommended: true,
    },
    {
      key: "billable_hours",
      name: "Billable hours",
      description:
        "Hours that can be directly attributed to work.",
      type: "Number",
      scope: "ITEM_PERIOD",
      unit: "hours",
      category: "Utilisation",
      recommended: true,
    },
    {
      key: "revenue_generated",
      name: "Revenue generated",
      description:
        "Revenue attributed to the individual.",
      type: "Currency",
      scope: "ITEM_PERIOD",
      unit: "CURRENCY",
      category: "Financial",
      recommended: true,
    },
    {
      key: "cost",
      name: "Cost",
      description:
        "Cost attributed to the individual.",
      type: "Currency",
      scope: "ITEM_PERIOD",
      unit: "CURRENCY",
      category: "Financial",
      recommended: true,
    },
    {
      key: "completed_items",
      name: "Completed items",
      description:
        "Number of completed pieces of work.",
      type: "Number",
      scope: "ITEM_PERIOD",
      unit: "items",
      category: "Output",
      recommended: false,
    },
  ],

  metrics: [
    {
      key: "utilisation",
      name: "Utilisation",
      description:
        "Billable hours as a percentage of available hours.",
      type: "Percentage",
      unit: "%",
      category: "Performance",
      formula:
        "billable_hours / available_hours * 100",
      requires: [
        "billable_hours",
        "available_hours",
      ],
      recommended: true,
    },
    {
      key: "contribution",
      name: "Contribution",
      description:
        "Revenue generated less cost.",
      type: "Currency",
      unit: "CURRENCY",
      category: "Financial",
      formula:
        "revenue_generated - cost",
      requires: [
        "revenue_generated",
        "cost",
      ],
      recommended: true,
    },
    {
      key: "revenue_per_hour",
      name: "Revenue per billable hour",
      description:
        "Revenue generated for each billable hour.",
      type: "Currency",
      unit: "CURRENCY",
      category: "Performance",
      formula:
        "revenue_generated / billable_hours",
      requires: [
        "revenue_generated",
        "billable_hours",
      ],
      recommended: false,
    },
  ],
};

const salesTemplate: TrackerTemplate = {
  type: "SALES",
  name: "Sales performance",
  description:
    "Track sales activity, pipeline, wins and revenue.",

  itemLabelSingular: "Sales rep",
  itemLabelPlural: "Sales reps",

  usesItems: true,

  recommendedPeriodType: "MONTH",

  inputs: [
    {
      key: "revenue",
      name: "Revenue",
      description:
        "Revenue generated during the period.",
      type: "Currency",
      scope: "ITEM_PERIOD",
      unit: "CURRENCY",
      category: "Revenue",
      recommended: true,
    },
    {
      key: "new_opportunities",
      name: "New opportunities",
      description:
        "New opportunities created.",
      type: "Number",
      scope: "ITEM_PERIOD",
      unit: "opportunities",
      category: "Pipeline",
      recommended: true,
    },
    {
      key: "won_opportunities",
      name: "Won opportunities",
      description:
        "Opportunities successfully won.",
      type: "Number",
      scope: "ITEM_PERIOD",
      unit: "opportunities",
      category: "Pipeline",
      recommended: true,
    },
    {
      key: "pipeline_value",
      name: "Pipeline value",
      description:
        "Value of the current pipeline.",
      type: "Currency",
      scope: "ITEM_PERIOD",
      unit: "CURRENCY",
      category: "Pipeline",
      recommended: false,
    },
  ],

  metrics: [
    {
      key: "win_rate",
      name: "Win rate",
      description:
        "Won opportunities as a percentage of new opportunities.",
      type: "Percentage",
      unit: "%",
      category: "Sales",
      formula:
        "won_opportunities / new_opportunities * 100",
      requires: [
        "won_opportunities",
        "new_opportunities",
      ],
      recommended: true,
    },
  ],
};

const customerTemplate: TrackerTemplate = {
  type: "CUSTOMER",
  name: "Customer performance",
  description:
    "Track customer growth, revenue and retention.",

  itemLabelSingular: "Customer",
  itemLabelPlural: "Customers",

  usesItems: true,

  recommendedPeriodType: "MONTH",

  inputs: [
    {
      key: "revenue",
      name: "Revenue",
      description:
        "Revenue generated by the customer.",
      type: "Currency",
      scope: "ITEM_PERIOD",
      unit: "CURRENCY",
      category: "Financial",
      recommended: true,
    },
    {
      key: "active",
      name: "Active",
      description:
        "Whether the customer is active.",
      type: "Number",
      scope: "ITEM_PERIOD",
      unit: "1 = active",
      category: "Customer",
      recommended: true,
    },
    {
      key: "new_business",
      name: "New business",
      description:
        "New revenue from the customer.",
      type: "Currency",
      scope: "ITEM_PERIOD",
      unit: "CURRENCY",
      category: "Growth",
      recommended: false,
    },
    {
      key: "support_issues",
      name: "Support issues",
      description:
        "Customer support issues during the period.",
      type: "Number",
      scope: "ITEM_PERIOD",
      unit: "issues",
      category: "Service",
      recommended: false,
    },
  ],

  metrics: [
    {
      key: "revenue_per_customer",
      name: "Revenue",
      description:
        "Revenue generated during the period.",
      type: "Currency",
      unit: "CURRENCY",
      category: "Financial",
      formula: "revenue",
      requires: ["revenue"],
      recommended: true,
    },
  ],
};

const operationsTemplate: TrackerTemplate = {
  type: "OPERATIONS",
  name: "Operations performance",
  description:
    "Track volume, cost, capacity and operational efficiency.",

  itemLabelSingular: "Operation",
  itemLabelPlural: "Operations",

  usesItems: true,

  recommendedPeriodType: "MONTH",

  inputs: [
    {
      key: "units_completed",
      name: "Units completed",
      description:
        "Number of units completed during the period.",
      type: "Number",
      scope: "ITEM_PERIOD",
      unit: "units",
      category: "Output",
      recommended: true,
    },
    {
      key: "operating_cost",
      name: "Operating cost",
      description:
        "Operating cost during the period.",
      type: "Currency",
      scope: "ITEM_PERIOD",
      unit: "CURRENCY",
      category: "Cost",
      recommended: true,
    },
    {
      key: "available_hours",
      name: "Available hours",
      description:
        "Available capacity during the period.",
      type: "Number",
      scope: "ITEM_PERIOD",
      unit: "hours",
      category: "Capacity",
      recommended: true,
    },
    {
      key: "used_hours",
      name: "Used hours",
      description:
        "Capacity used during the period.",
      type: "Number",
      scope: "ITEM_PERIOD",
      unit: "hours",
      category: "Capacity",
      recommended: true,
    },
    {
      key: "issues",
      name: "Issues",
      description:
        "Operational issues during the period.",
      type: "Number",
      scope: "ITEM_PERIOD",
      unit: "issues",
      category: "Quality",
      recommended: false,
    },
  ],

  metrics: [
    {
      key: "cost_per_unit",
      name: "Cost per unit",
      description:
        "Operating cost for each completed unit.",
      type: "Currency",
      unit: "CURRENCY",
      category: "Efficiency",
      formula:
        "operating_cost / units_completed",
      requires: [
        "operating_cost",
        "units_completed",
      ],
      recommended: true,
    },
    {
      key: "capacity_utilisation",
      name: "Capacity utilisation",
      description:
        "Used capacity as a percentage of available capacity.",
      type: "Percentage",
      unit: "%",
      category: "Efficiency",
      formula:
        "used_hours / available_hours * 100",
      requires: [
        "used_hours",
        "available_hours",
      ],
      recommended: true,
    },
  ],
};

const customTemplate: TrackerTemplate = {
  type: "CUSTOM",
  name: "Custom tracker",
  description:
    "Start from a blank tracker and define your own measures.",

  itemLabelSingular: "Item",
  itemLabelPlural: "Items",

  usesItems: true,

  recommendedPeriodType: "MONTH",

  inputs: [],
  metrics: [],
};

export const TRACKER_TEMPLATES: Record<
  ModelType,
  TrackerTemplate
> = {
  COMPANY: companyTemplate,
  PROJECT: projectTemplate,
  INDIVIDUAL: individualTemplate,
  SALES: salesTemplate,
  CUSTOMER: customerTemplate,
  OPERATIONS: operationsTemplate,
  CUSTOM: customTemplate,
};
export function getPeriodOptions() {
  return [
    {
      value: "MONTH" as const,
      label: "Monthly",
    },
    {
      value: "QUARTER" as const,
      label: "Quarterly",
    },
    {
      value: "YEAR" as const,
      label: "Yearly",
    },
  ];
}
export function getTrackerTemplate(
  type: ModelType,
) {
  return TRACKER_TEMPLATES[type];
}