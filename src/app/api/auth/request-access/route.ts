import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

import {
  randomBytes,
  scryptSync,
} from "crypto";


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


    if (
      password.length < 8
    ) {

      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters.",
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


    await prisma.user.create({

      data: {

        email,

        name:
          email.split("@")[0],

        passwordHash:
          hashPassword(
            password
          ),

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
