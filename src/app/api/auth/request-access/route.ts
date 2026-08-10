import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

import {
  hashPassword,
} from "@/lib/password";


export async function POST(
  request: Request
) {

  try {

    const formData =
      await request.formData();


    const email =
      String(
        formData.get("email") || ""
      )
      .trim()
      .toLowerCase();


    const password =
      String(
        formData.get("password") || ""
      );


    if (!email) {

      return NextResponse.json(
        {
          error:
            "Email address is required.",
        },
        {
          status: 400,
        }
      );

    }


    /*
     * Keep password requirements consistent
     * with the password reset flow.
     */

    if (
      password.length < 12
    ) {

      return NextResponse.json(
        {
          error:
            "Password must be at least 12 characters.",
        },
        {
          status: 400,
        }
      );

    }


    const existingUser =
      await prisma.user.findUnique({

        where: {
          email,
        },

      });


    if (existingUser) {

      if (
        existingUser.status ===
        "PENDING"
      ) {

        return NextResponse.json(
          {
            error:
              "An access request for this email is already pending.",
          },
          {
            status: 409,
          }
        );

      }


      if (
        existingUser.status ===
        "APPROVED"
      ) {

        return NextResponse.json(
          {
            error:
              "An account already exists for this email. Please sign in.",
          },
          {
            status: 409,
          }
        );

      }


      return NextResponse.json(
        {
          error:
            "This account cannot currently request access.",
        },
        {
          status: 409,
        }
      );

    }


    /*
     * Use the same password hashing implementation
     * used by registration and password reset.
     *
     * Stored format:
     *
     * scrypt$salt$derivedKey
     */

    const passwordHash =
      await hashPassword(
        password
      );


    await prisma.user.create({

      data: {

        email,

        name:
          email.split("@")[0],

        passwordHash,

        role:
          "USER",

        status:
          "PENDING",

      },

    });


    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "Access request error:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Unable to submit access request.",
      },
      {
        status: 500,
      }
    );

  }

}
