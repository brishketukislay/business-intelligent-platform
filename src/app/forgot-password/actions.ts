"use server";

import {
  prisma,
} from "@/lib/prisma";

import {
  generateResetToken,
  hashResetToken,
} from "@/lib/password-reset";


export async function requestPasswordReset(
  formData: FormData
) {

  const email =
    String(
      formData.get("email") ?? ""
    ).trim().toLowerCase();


  if (!email) {

    return {
      success: false,
      error: "Please enter your email address.",
    };

  }


  const user =
    await prisma.user.findUnique({

      where: {
        email,
      },

    });


  /*
   * Deliberately return the same general response
   * whether or not the email exists.
   *
   * This prevents account enumeration.
   */

  if (!user) {

    return {
      success: true,
      resetLink: null,
    };

  }


  const token =
    generateResetToken();


  const tokenHash =
    hashResetToken(token);


  const expiresAt =
    new Date(
      Date.now() +
      1000 * 60 * 30
    );


  await prisma.passwordResetToken.deleteMany({

    where: {

      userId: user.id,

      usedAt: null,

    },

  });


  await prisma.passwordResetToken.create({

    data: {

      userId: user.id,

      tokenHash,

      expiresAt,

    },

  });


  const baseUrl =
    process.env.AUTH_URL ||
    "http://localhost:3000";


  const resetLink =
    `${baseUrl}/reset-password?token=${token}`;


  /*
   * DEVELOPMENT ONLY:
   *
   * We don't have email delivery yet, so the
   * reset link is returned to the UI.
   *
   * Later this should be replaced with an
   * email delivery service.
   */

  return {

    success: true,

    resetLink,

  };

}
