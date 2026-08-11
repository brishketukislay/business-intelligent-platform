import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  getBusinessModelById,
} from "@/features/models/services/model-service";

import {
  getInputDefinitions,
} from "@/features/inputs/services/input-service";

import {
  InputForm,
} from "@/features/inputs/components/input-form";

import {
  InputTable,
} from "@/features/inputs/components/input-table";

import {
  ModelEditForm,
} from "@/features/models/components/model-edit-form";

import {
  ModelPeriodSettings,
} from "@/features/models/components/model-period-settings";

import {
  prisma,
} from "@/lib/prisma";


type ModelEditPageProps = {
  params: Promise<{
    modelId: string;
  }>;
};


export default async function ModelEditPage({
  params,
}: ModelEditPageProps) {

  const {
    modelId,
  } = await params;


  if (!modelId) {
    notFound();
  }


  const user =
    await requireCurrentUser();


  const model =
    await getBusinessModelById(
      modelId,
      user.id
    );


  if (!model) {
    notFound();
  }


  const inputs =
    await getInputDefinitions(
      modelId,
      user.id
    );


  const periods =
    await prisma.modelPeriod.findMany({

      where: {
        modelId,
      },

      orderBy: {
        sortOrder: "asc",
      },

      select: {

        id: true,

        name: true,

        key: true,

        startDate: true,

        endDate: true,

        sortOrder: true,

        status: true,

      },

    });


  return (

    <div className="space-y-8">

      <div className="space-y-3">

        <Link
          href={`/models/${model.id}`}
          className="
            text-sm
            text-muted-foreground
            hover:text-foreground
          "
        >
          ← Back to {model.name}
        </Link>


        <div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Model
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure the model structure. Inputs and calculations
            are defined here rather than being hard-coded.
          </p>

        </div>

      </div>


      {/* Basic model information */}

      <section className="rounded-lg border bg-background">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold">
            Model Details
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure the name, description and status.
          </p>

        </div>


        <div className="p-6">

          <ModelEditForm
            model={model}
          />

        </div>

      </section>


      {/* Periods */}

      <section className="rounded-lg border bg-background">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold">
            Periods
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Define the periods available to this model.
          </p>

        </div>


        <div className="p-6">

          <ModelPeriodSettings
            modelId={model.id}
            periods={
              periods.map(
                (period:any) => ({

                  id:
                    period.id,

                  name:
                    period.name,

                  key:
                    period.key,

                  startDate:
                    period.startDate.toISOString(),

                  endDate:
                    period.endDate.toISOString(),

                  sortOrder:
                    period.sortOrder,

                  status:
                    period.status,

                })
              )
            }
          />

        </div>

      </section>


      {/* Inputs */}

      <section className="rounded-lg border bg-background">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold">
            Input Definitions
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Define the variables that make up this model.
            Nothing is predefined here.
          </p>

        </div>


        <div className="space-y-8 p-6">

          <div className="rounded-lg border bg-muted/20 p-6">

            <h3 className="font-semibold">
              Add Input
            </h3>

            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Create a new variable for the model.
            </p>


            <InputForm
              modelId={model.id}
            />

          </div>


          <div>

            <h3 className="mb-4 font-semibold">
              Configured Inputs
            </h3>


            <InputTable
  modelId={model.id}
  inputs={inputs}
/>

          </div>

        </div>

      </section>


      <div className="flex justify-end">

        <Link
          href={`/models/${model.id}`}
          className="
            inline-flex
            h-10
            items-center
            justify-center
            rounded-md
            bg-primary
            px-4
            py-2
            text-sm
            font-medium
            text-primary-foreground
            hover:bg-primary/90
          "
        >
          Done
        </Link>

      </div>

    </div>

  );

}
