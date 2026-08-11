import {
  prisma,
} from "@/lib/prisma";

type DuplicateScenarioInput = {
  scenarioId: string;
  userId: string;
};

async function getCopyName(
  modelId: string,
  sourceName: string
) {
  const baseName =
    `Copy of ${sourceName}`;

  const existing =
    await prisma.scenario.findMany({
      where: {
        modelId,
        status: "ACTIVE",
        name: {
          startsWith: baseName,
        },
      },
      select: {
        name: true,
      },
    });

  const names = new Set(
    existing.map(
      (scenario:any) =>
        scenario.name
    )
  );

  if (!names.has(baseName)) {
    return baseName;
  }

  let number = 2;

  while (
    names.has(
      `${baseName} (${number})`
    )
  ) {
    number++;
  }

  return `${baseName} (${number})`;
}

export async function duplicateScenarioRecord({
  scenarioId,
  userId,
}: DuplicateScenarioInput) {
  const source =
    await prisma.scenario.findUnique({
      where: {
        id: scenarioId,
      },
      include: {
        values: true,
      },
    });

  if (!source) {
    throw new Error(
      "Scenario not found."
    );
  }

  const name =
    await getCopyName(
      source.modelId,
      source.name
    );

  return prisma.$transaction(
    async (tx:any) => {
      const copy =
        await tx.scenario.create({
          data: {
            modelId:
              source.modelId,

            createdBy:
              userId,

            name,

            description:
              source.description,

            status: "ACTIVE",
          },
        });

      if (
        source.values.length > 0
      ) {
        await tx.scenarioValue.createMany({
          data:
            source.values.map(
              (value:any) => ({
                scenarioId:
                  copy.id,

                inputId:
                  value.inputId,

                periodId:
                  value.periodId,

                value:
                  value.value,
              })
            ),
        });
      }

      return copy;
    }
  );
}