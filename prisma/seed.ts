import {
  PrismaClient,
} from "@prisma/client";


const prisma = new PrismaClient();


async function main() {

  const existingModel =
    await prisma.businessModel.findFirst({
      where: {
        name: "Default Model",
      },
    });


  if (existingModel) {

    console.log(
      "Default BusinessModel already exists"
    );

    return;

  }


  const user =
    await prisma.user.create({
      data: {
        name: "System Admin",
        email: "admin@example.com",
        role: "ADMIN",
      },
    });


  await prisma.businessModel.create({

    data: {

      name: "Default Model",

      description:
        "Initial configurable business model",

      status:
        "ACTIVE",

      createdBy:
        user.id,

    },

  });


  console.log(
    "Default BusinessModel created"
  );

}


main()
  .catch((error) => {

    console.error(error);

    process.exit(1);

  })
  .finally(async () => {

    await prisma.$disconnect();

  });
