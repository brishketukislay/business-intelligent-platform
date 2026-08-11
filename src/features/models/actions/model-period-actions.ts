"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  prisma,
} from "@/lib/prisma";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  requireModelEditAccess,
} from "@/lib/model-access";


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


export async function generateModelPeriodsAction(
  modelId: string,
  fiscalYearStartMonth: number = 1
) {

  const user =
    await requireCurrentUser();


  await requireModelEditAccess(
    modelId,
    user.id
  );


  if (
    fiscalYearStartMonth < 1 ||
    fiscalYearStartMonth > 12
  ) {

    return {
      success: false,
      error: "Invalid fiscal year start month.",
    };

  }


  try {

    const model =
      await prisma.businessModel.findUnique({

        where: {
          id: modelId,
        },

        select: {
          id: true,
        },

      });


    if (!model) {

      return {
        success: false,
        error: "Business model not found.",
      };

    }


    const existingPeriods =
      await prisma.modelPeriod.count({

        where: {
          modelId,
        },

      });


    if (existingPeriods > 0) {

      return {

        success: false,

        error:
          "Periods have already been generated for this model.",

      };

    }


    const existingValues =
      await prisma.periodValue.count({

        where: {

          period: {
            modelId,
          },

        },

      });


    if (existingValues > 0) {

      return {

        success: false,

        error:
          "This model already contains period values.",

      };

    }


    const currentYear =
      new Date().getFullYear();


    const periods =
      Array.from(
        {
          length: 12,
        },
        (_, index) => {

          const monthIndex =
            (
              fiscalYearStartMonth -
              1 +
              index
            ) % 12;


          const year =
            currentYear +
            Math.floor(
              (
                fiscalYearStartMonth -
                1 +
                index
              ) / 12
            );


          const startDate =
            new Date(
              year,
              monthIndex,
              1
            );


          const endDate =
            new Date(
              year,
              monthIndex + 1,
              0,
              23,
              59,
              59,
              999
            );


          return {

            modelId,

            name:
              MONTHS[monthIndex],

            key:
              `${year}-${String(
                monthIndex + 1
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


    await prisma.$transaction(
      async (tx:any) => {

        await tx.modelPeriod.createMany({

          data:
            periods,

        });


        await tx.businessModelSettings.upsert({

          where: {
            modelId,
          },

          create: {

            modelId,

            currency:
              "GBP",

            fiscalYearStartMonth:
              fiscalYearStartMonth,

            periodType:
              "MONTH",

          },

          update: {

            fiscalYearStartMonth:
              fiscalYearStartMonth,

            periodType:
              "MONTH",

          },

        });

      }
    );


    revalidatePath(
      `/models/${modelId}/edit`
    );

    revalidatePath(
      `/models/${modelId}/inputs`
    );


    return {
      success: true,
    };

  } catch (error) {

    console.error(
      "Failed to generate model periods:",
      error
    );


    return {

      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Unable to generate model periods.",

    };

  }

}
