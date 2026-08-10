import {
  prisma,
} from "@/lib/prisma";


const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


const FINANCE_INPUTS = [
  {
    name: "Revenue",
    key: "revenue",
    type: "Currency",
    unit: "GBP",
    category: "Revenue",
  },

  {
    name: "Cost of Goods Sold",
    key: "cogs",
    type: "Currency",
    unit: "GBP",
    category: "Costs",
  },

  {
    name: "Operating Expenses",
    key: "operating_expenses",
    type: "Currency",
    unit: "GBP",
    category: "Operating Costs",
  },

  {
    name: "Headcount",
    key: "headcount",
    type: "Number",
    unit: "people",
    category: "People",
  },

  {
    name: "Average Salary",
    key: "average_salary",
    type: "Currency",
    unit: "GBP",
    category: "Payroll",
  },

  {
    name: "Marketing Spend",
    key: "marketing_spend",
    type: "Currency",
    unit: "GBP",
    category: "Marketing",
  },

  {
    name: "Cash Balance",
    key: "cash_balance",
    type: "Currency",
    unit: "GBP",
    category: "Cash",
  },
] as const;


const FINANCE_METRICS = [
  {
    name: "Gross Profit",
    key: "gross_profit",
    type: "Currency",
    unit: "GBP",
    category: "Profitability",
    formula:
      "revenue - cogs",
  },

  {
    name: "Gross Margin",
    key: "gross_margin",
    type: "Percentage",
    unit: "%",
    category: "Profitability",
    formula:
      "(revenue - cogs) / revenue * 100",
  },

  {
    name: "Total Payroll",
    key: "total_payroll",
    type: "Currency",
    unit: "GBP",
    category: "Payroll",
    formula:
      "headcount * average_salary",
  },

  {
    name: "Operating Profit",
    key: "operating_profit",
    type: "Currency",
    unit: "GBP",
    category: "Profitability",
    formula:
      "revenue - cogs - operating_expenses - total_payroll - marketing_spend",
  },

  {
    name: "Operating Margin",
    key: "operating_margin",
    type: "Percentage",
    unit: "%",
    category: "Profitability",
    formula:
      "(revenue - cogs - operating_expenses - total_payroll - marketing_spend) / revenue * 100",
  },
] as const;


export async function createFinanceModel(
  userId: string
) {

  const currentYear =
    new Date().getFullYear();


  return prisma.$transaction(
    async (tx) => {

      /*
       * Create the business model.
       */

      const model =
        await tx.businessModel.create({

          data: {

            name:
              "Finance Model",

            description:
              "Monthly financial model for revenue, costs, profitability and cash planning.",

            status:
              "ACTIVE",

            createdBy:
              userId,

          },

        });


      /*
       * Create monthly periods.
       */

      const periods =
        MONTHS.map(
          (
            month,
            index
          ) => {

            const startDate =
              new Date(
                currentYear,
                index,
                1
              );


            const endDate =
              new Date(
                currentYear,
                index + 1,
                0,
                23,
                59,
                59,
                999
              );


            return {

              modelId:
                model.id,

              name:
                month,

              key:
                `${currentYear}-${String(
                  index + 1
                ).padStart(2, "0")}`,

              startDate,

              endDate,

              sortOrder:
                index,

              status:
                "ACTIVE",

            };

          }
        );


      await tx.modelPeriod.createMany({

        data:
          periods,

      });


      /*
       * Create model settings.
       */

      await tx.businessModelSettings.create({

        data: {

          modelId:
            model.id,

          currency:
            "GBP",

          fiscalYearStartMonth:
            1,

          periodType:
            "MONTH",

        },

      });


      /*
       * Create finance input definitions.
       */

      await tx.inputDefinition.createMany({

        data:
          FINANCE_INPUTS.map(
            (input) => ({

              modelId:
                model.id,

              name:
                input.name,

              key:
                input.key,

              type:
                input.type,

              unit:
                input.unit,

              category:
                input.category,

              status:
                "ACTIVE",

            })
          ),

      });


      /*
       * Create finance metric definitions.
       */

      await tx.metricDefinition.createMany({

        data:
          FINANCE_METRICS.map(
            (metric) => ({

              modelId:
                model.id,

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

              status:
                "ACTIVE",

            })
          ),

      });


      return model;

    }
  );

}
