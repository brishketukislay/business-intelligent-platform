import type {
  ModelType,
  PeriodType,
} from "../types";

type TrackerInputTemplate = {
  name: string;
  key: string;
  type: "Number" | "Currency" | "Percentage" | "Text";
  unit?: string;
  category?: string;
  scope: "PERIOD";
};

type TrackerMetricTemplate = {
  name: string;
  key: string;
  type: "Number" | "Currency" | "Percentage";
  unit?: string;
  category?: string;
  formula: string;
};

export type TrackerTemplate = {
  type: ModelType;
  description: string;
  inputs: TrackerInputTemplate[];
  metrics: TrackerMetricTemplate[];
};

const currency = "GBP";

const templates: Record<ModelType, TrackerTemplate> = {
  COMPANY: {
    type: "COMPANY",
    description:
      "Track overall business performance, profitability, people and cash.",
    inputs: [
      {
        name: "Revenue",
        key: "revenue",
        type: "Currency",
        unit: currency,
        category: "Financial",
        scope: "PERIOD",
      },
      {
        name: "Operating Costs",
        key: "operating_costs",
        type: "Currency",
        unit: currency,
        category: "Financial",
        scope: "PERIOD",
      },
      {
        name: "Cash Balance",
        key: "cash_balance",
        type: "Currency",
        unit: currency,
        category: "Financial",
        scope: "PERIOD",
      },
      {
        name: "Headcount",
        key: "headcount",
        type: "Number",
        unit: "people",
        category: "People",
        scope: "PERIOD",
      },
      {
        name: "Customer Count",
        key: "customer_count",
        type: "Number",
        unit: "customers",
        category: "Customers",
        scope: "PERIOD",
      },
    ],
    metrics: [
      {
        name: "Operating Profit",
        key: "operating_profit",
        type: "Currency",
        unit: currency,
        category: "Profitability",
        formula: "revenue - operating_costs",
      },
      {
        name: "Operating Margin",
        key: "operating_margin",
        type: "Percentage",
        unit: "%",
        category: "Profitability",
        formula:
          "(revenue - operating_costs) / revenue * 100",
      },
      {
        name: "Revenue Per Customer",
        key: "revenue_per_customer",
        type: "Currency",
        unit: currency,
        category: "Customers",
        formula: "revenue / customer_count",
      },
    ],
  },

  PROJECT: {
    type: "PROJECT",
    description:
      "Track delivery, financial performance, effort and project health.",
    inputs: [
      {
        name: "Revenue",
        key: "revenue",
        type: "Currency",
        unit: currency,
        category: "Financial",
        scope: "PERIOD",
      },
      {
        name: "Project Cost",
        key: "project_cost",
        type: "Currency",
        unit: currency,
        category: "Financial",
        scope: "PERIOD",
      },
      {
        name: "Budget",
        key: "budget",
        type: "Currency",
        unit: currency,
        category: "Financial",
        scope: "PERIOD",
      },
      {
        name: "Hours Worked",
        key: "hours_worked",
        type: "Number",
        unit: "hours",
        category: "Delivery",
        scope: "PERIOD",
      },
      {
        name: "Completion",
        key: "completion",
        type: "Percentage",
        unit: "%",
        category: "Delivery",
        scope: "PERIOD",
      },
      {
        name: "Issues",
        key: "issues",
        type: "Number",
        unit: "issues",
        category: "Delivery",
        scope: "PERIOD",
      },
    ],
    metrics: [
      {
        name: "Project Profit",
        key: "project_profit",
        type: "Currency",
        unit: currency,
        category: "Financial",
        formula: "revenue - project_cost",
      },
      {
        name: "Project Margin",
        key: "project_margin",
        type: "Percentage",
        unit: "%",
        category: "Financial",
        formula:
          "(revenue - project_cost) / revenue * 100",
      },
      {
        name: "Budget Variance",
        key: "budget_variance",
        type: "Currency",
        unit: currency,
        category: "Financial",
        formula: "budget - project_cost",
      },
    ],
  },

  INDIVIDUAL: {
    type: "INDIVIDUAL",
    description:
      "Track individual performance, utilisation, output and financial contribution.",
    inputs: [
      {
        name: "Billable Hours",
        key: "billable_hours",
        type: "Number",
        unit: "hours",
        category: "Utilisation",
        scope: "PERIOD",
      },
      {
        name: "Available Hours",
        key: "available_hours",
        type: "Number",
        unit: "hours",
        category: "Utilisation",
        scope: "PERIOD",
      },
      {
        name: "Revenue Generated",
        key: "revenue_generated",
        type: "Currency",
        unit: currency,
        category: "Financial",
        scope: "PERIOD",
      },
      {
        name: "Cost",
        key: "cost",
        type: "Currency",
        unit: currency,
        category: "Financial",
        scope: "PERIOD",
      },
      {
        name: "Completed Items",
        key: "completed_items",
        type: "Number",
        unit: "items",
        category: "Output",
        scope: "PERIOD",
      },
    ],
    metrics: [
      {
        name: "Utilisation",
        key: "utilisation",
        type: "Percentage",
        unit: "%",
        category: "Performance",
        formula:
          "billable_hours / available_hours * 100",
      },
      {
        name: "Contribution",
        key: "contribution",
        type: "Currency",
        unit: currency,
        category: "Financial",
        formula:
          "revenue_generated - cost",
      },
      {
        name: "Revenue Per Hour",
        key: "revenue_per_hour",
        type: "Currency",
        unit: currency,
        category: "Performance",
        formula:
          "revenue_generated / billable_hours",
      },
    ],
  },

  SALES: {
    type: "SALES",
    description:
      "Track sales activity, pipeline conversion and revenue.",
    inputs: [
      {
        name: "Revenue",
        key: "revenue",
        type: "Currency",
        unit: currency,
        category: "Revenue",
        scope: "PERIOD",
      },
      {
        name: "New Opportunities",
        key: "new_opportunities",
        type: "Number",
        unit: "opportunities",
        category: "Pipeline",
        scope: "PERIOD",
      },
      {
        name: "Won Opportunities",
        key: "won_opportunities",
        type: "Number",
        unit: "opportunities",
        category: "Pipeline",
        scope: "PERIOD",
      },
      {
        name: "Pipeline Value",
        key: "pipeline_value",
        type: "Currency",
        unit: currency,
        category: "Pipeline",
        scope: "PERIOD",
      },
    ],
    metrics: [
      {
        name: "Win Rate",
        key: "win_rate",
        type: "Percentage",
        unit: "%",
        category: "Sales",
        formula:
          "won_opportunities / new_opportunities * 100",
      },
    ],
  },

  CUSTOMER: {
    type: "CUSTOMER",
    description:
      "Track customer growth, revenue, retention and service performance.",
    inputs: [
      {
        name: "Revenue",
        key: "revenue",
        type: "Currency",
        unit: currency,
        category: "Financial",
        scope: "PERIOD",
      },
      {
        name: "Active Customers",
        key: "active_customers",
        type: "Number",
        unit: "customers",
        category: "Customers",
        scope: "PERIOD",
      },
      {
        name: "New Customers",
        key: "new_customers",
        type: "Number",
        unit: "customers",
        category: "Customers",
        scope: "PERIOD",
      },
      {
        name: "Churned Customers",
        key: "churned_customers",
        type: "Number",
        unit: "customers",
        category: "Customers",
        scope: "PERIOD",
      },
    ],
    metrics: [
      {
        name: "Revenue Per Customer",
        key: "revenue_per_customer",
        type: "Currency",
        unit: currency,
        category: "Financial",
        formula:
          "revenue / active_customers",
      },
      {
        name: "Churn Rate",
        key: "churn_rate",
        type: "Percentage",
        unit: "%",
        category: "Customers",
        formula:
          "churned_customers / active_customers * 100",
      },
    ],
  },

  OPERATIONS: {
    type: "OPERATIONS",
    description:
      "Track operational volume, quality, efficiency and cost.",
    inputs: [
      {
        name: "Units Completed",
        key: "units_completed",
        type: "Number",
        unit: "units",
        category: "Output",
        scope: "PERIOD",
      },
      {
        name: "Operating Cost",
        key: "operating_cost",
        type: "Currency",
        unit: currency,
        category: "Cost",
        scope: "PERIOD",
      },
      {
        name: "Issues",
        key: "issues",
        type: "Number",
        unit: "issues",
        category: "Quality",
        scope: "PERIOD",
      },
      {
        name: "Available Hours",
        key: "available_hours",
        type: "Number",
        unit: "hours",
        category: "Capacity",
        scope: "PERIOD",
      },
      {
        name: "Used Hours",
        key: "used_hours",
        type: "Number",
        unit: "hours",
        category: "Capacity",
        scope: "PERIOD",
      },
    ],
    metrics: [
      {
        name: "Cost Per Unit",
        key: "cost_per_unit",
        type: "Currency",
        unit: currency,
        category: "Efficiency",
        formula:
          "operating_cost / units_completed",
      },
      {
        name: "Capacity Utilisation",
        key: "capacity_utilisation",
        type: "Percentage",
        unit: "%",
        category: "Efficiency",
        formula:
          "used_hours / available_hours * 100",
      },
    ],
  },

  CUSTOM: {
    type: "CUSTOM",
    description:
      "Build your own performance tracker.",
    inputs: [],
    metrics: [],
  },
};

export function getTrackerTemplate(
  type: ModelType,
): TrackerTemplate {
  return templates[type];
}

export function getPeriodOptions(): {
  value: PeriodType;
  label: string;
}[] {
  return [
    {
      value: "MONTH",
      label: "Monthly",
    },
    {
      value: "QUARTER",
      label: "Quarterly",
    },
    {
      value: "YEAR",
      label: "Annually",
    },
  ];
}