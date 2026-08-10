"use server";

import {
  prisma,
} from "@/lib/prisma";

import {
  hashPassword,
} from "@/lib/password";

import {
  hashResetToken,
} from "@/lib/password-reset";

import {
  redirect,
} from "next/navigation";


export async function resetPassword(
  formData: FormData
) {

  const token =
    String(
      formData.get("token") ?? ""
    );


  const password =
    String(
      formData.get("password") ?? ""
    );


  const confirmation =
    String(
      formData.get("confirmation") ?? ""
    );


  if (!token) {

    throw new Error(
      "Invalid password reset link."
    );

  }


  if (
    password.length < 12
  ) {

    throw new Error(
      "Password must be at least 12 characters."
    );

  }


  if (
    password !== confirmation
  ) {

    throw new Error(
      "Passwords do not match."
    );

  }


  const tokenHash =
    hashResetToken(token);


  const resetToken =
    await prisma.passwordResetToken.findUnique({

      where: {
        tokenHash,
      },

    });


  if (!resetToken) {

    throw new Error(
      "Invalid password reset link."
    );

  }


  if (resetToken.usedAt) {

    throw new Error(
      "This password reset link has already been used."
    );

  }


  if (
    resetToken.expiresAt <= new Date()
  ) {

    throw new Error(
      "This password reset link has expired."
    );

  }


  const passwordHash =
    await hashPassword(
      password
    );


  await prisma.$transaction([

    prisma.user.update({

      where: {
        id: resetToken.userId,
      },

      data: {
        passwordHash,
      },

    }),


    prisma.passwordResetToken.update({

      where: {
        id: resetToken.id,
      },

      data: {
        usedAt: new Date(),
      },

    }),

  ]);


  redirect(
    "/login?reset=1"
  );

}
