"use server";

import {
  redirect,
} from "next/navigation";

import {
  auth,
} from "@/auth";

import {
  prisma,
} from "@/lib/prisma";


async function requireAdmin() {

  const session =
    await auth();


  if (!session?.user?.id) {
    redirect("/login");
  }


  if (
    session.user.role !==
    "ADMIN"
  ) {
    redirect("/models");
  }


  return session.user;

}


export async function approveUser(
  formData: FormData
) {

  await requireAdmin();


  const userId =
    String(
      formData.get("userId") || ""
    );


  if (!userId) {
    return;
  }


  await prisma.user.update({

    where: {
      id: userId,
    },

    data: {
      status: "ACTIVE",
    },

  });


  redirect("/admin/users");

}


export async function disableUser(
  formData: FormData
) {

  const admin =
    await requireAdmin();


  const userId =
    String(
      formData.get("userId") || ""
    );


  if (
    !userId ||
    userId === admin.id
  ) {
    return;
  }


  await prisma.user.update({

    where: {
      id: userId,
    },

    data: {
      status: "DISABLED",
    },

  });


  redirect("/admin/users");

}


export async function enableUser(
  formData: FormData
) {

  await requireAdmin();


  const userId =
    String(
      formData.get("userId") || ""
    );


  if (!userId) {
    return;
  }


  await prisma.user.update({

    where: {
      id: userId,
    },

    data: {
      status: "ACTIVE",
    },

  });


  redirect("/admin/users");

}