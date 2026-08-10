import {
  PrismaClient,
} from "@prisma/client";

import {
  randomBytes,
  scryptSync,
} from "crypto";


const prisma =
  new PrismaClient();


function hashPassword(
  password: string
): string {

  const salt =
    randomBytes(16).toString("hex");

  const hash =
    scryptSync(
      password,
      salt,
      64
    ).toString("hex");

  return `${salt}:${hash}`;

}


async function main() {

  const adminEmail =
    "admin@example.com";

  const adminPassword =
    "ChangeMe123!";


  const existingAdmin =
    await prisma.user.findUnique({

      where: {
        email: adminEmail,
      },

    });


  let admin;


  if (existingAdmin) {

    admin =
      await prisma.user.update({

        where: {
          id: existingAdmin.id,
        },

        data: {

          role: "ADMIN",

          status: "APPROVED",

          passwordHash:
            hashPassword(
              adminPassword
            ),

        },

      });

    console.log(
      "Existing admin account updated."
    );

  } else {

    admin =
      await prisma.user.create({

        data: {

          name:
            "System Admin",

          email:
            adminEmail,

          passwordHash:
            hashPassword(
              adminPassword
            ),

          role:
            "ADMIN",

          status:
            "APPROVED",

        },

      });

    console.log(
      "Admin account created."
    );

  }


  const existingModel =
    await prisma.businessModel.findFirst({

      where: {

        name:
          "Default Model",

        createdBy:
          admin.id,

      },

    });


  if (!existingModel) {

    await prisma.businessModel.create({

      data: {

        name:
          "Default Model",

        description:
          "Initial configurable business model",

        status:
          "ACTIVE",

        createdBy:
          admin.id,

      },

    });

    console.log(
      "Default BusinessModel created."
    );

  } else {

    console.log(
      "Default BusinessModel already exists."
    );

  }


  console.log("");
  console.log(
    "Development admin credentials:"
  );
  console.log(
    `Email: ${adminEmail}`
  );
  console.log(
    `Password: ${adminPassword}`
  );
  console.log("");
  console.log(
    "Change this password before using the application outside development."
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