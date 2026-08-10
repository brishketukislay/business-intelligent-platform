"use server";

import {
  auth,
} from "@/auth";

import {
  prisma,
} from "@/lib/prisma";

import {
  revalidatePath,
} from "next/cache";


async function requireAdmin() {

  const session =
    await auth();


  if (!session?.user?.id) {

    throw new Error(
      "Unauthorized."
    );

  }


  if (
    session.user.role !== "ADMIN"
  ) {

    throw new Error(
      "Forbidden."
    );

  }


  return session;

}


export async function approveUser(
  formData: FormData
) {

  await requireAdmin();


  const userId =
    String(
      formData.get("userId") ?? ""
    );


  if (!userId) {

    throw new Error(
      "User ID is required."
    );

  }


  await prisma.user.update({

    where: {
      id: userId,
    },

    data: {
      status: "ACTIVE",
    },

  });


  revalidatePath(
    "/admin/users"
  );

}


export async function disableUser(
  formData: FormData
) {

  const session =
    await requireAdmin();


  const userId =
    String(
      formData.get("userId") ?? ""
    );


  if (
    !userId ||
    userId === session.user.id
  ) {

    throw new Error(
      "Invalid user."
    );

  }


  await prisma.user.update({

    where: {
      id: userId,
    },

    data: {
      status: "DISABLED",
    },

  });


  revalidatePath(
    "/admin/users"
  );

}
