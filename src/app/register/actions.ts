"use server";

import {
  prisma,
} from "@/lib/prisma";

import {
  hashPassword,
} from "@/lib/password";

import {
  redirect,
} from "next/navigation";


export async function registerUser(
  formData: FormData
) {

  const name =
    String(
      formData.get("name") ?? ""
    ).trim();


  const email =
    String(
      formData.get("email") ?? ""
    ).trim().toLowerCase();


  const password =
    String(
      formData.get("password") ?? ""
    );


  if (
    !name ||
    !email ||
    !password
  ) {

    throw new Error(
      "All fields are required."
    );

  }


  if (password.length < 12) {

    throw new Error(
      "Password must be at least 12 characters."
    );

  }


  const existingUser =
    await prisma.user.findUnique({

      where: {
        email,
      },

    });


  if (existingUser) {

    throw new Error(
      "An account with this email already exists."
    );

  }


  const passwordHash =
    await hashPassword(
      password
    );


  await prisma.user.create({

    data: {

      name,

      email,

      passwordHash,

      role: "USER",

      status: "PENDING",

    },

  });


  redirect(
    "/login?requested=1"
  );

}
