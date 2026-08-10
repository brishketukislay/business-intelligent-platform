import {
  redirect,
} from "next/navigation";

import {
  auth,
} from "@/auth";

import {
  prisma,
} from "@/lib/prisma";

import {
  approveUser,
  disableUser,
  enableUser,
  makeAdmin,
  makeUser,
} from "./actions";


export default async function AdminUsersPage() {

  const session =
    await auth();


  if (!session?.user?.id) {

    redirect("/login");

  }


  if (
    session.user.role !== "ADMIN"
  ) {

    redirect("/dashboard");

  }


  const users =
    await prisma.user.findMany({

      orderBy: {
        createdAt: "desc",
      },

      select: {

        id: true,

        name: true,

        email: true,

        role: true,

        status: true,

        createdAt: true,

      },

    });


  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-2xl font-semibold">
          User Management
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Approve and manage platform users.
        </p>

      </div>


      <div className="overflow-x-auto rounded-lg border bg-background">

        <table className="w-full min-w-[800px] text-sm">

          <thead className="border-b bg-muted/30">

            <tr>

              <th className="px-4 py-3 text-left font-medium">
                Name
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Email
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Role
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Status
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Action
              </th>

            </tr>

          </thead>


          <tbody>

            {users.map((user) => (

              <tr
                key={user.id}
                className="border-b last:border-0"
              >

                <td className="px-4 py-3">
                  {user.name ?? "—"}
                </td>


                <td className="px-4 py-3">
                  {user.email}
                </td>


                <td className="px-4 py-3">
                  {user.role}
                </td>


                <td className="px-4 py-3">
                  {user.status}
                </td>


                <td className="px-4 py-3 text-right">

                  <div className="flex flex-wrap justify-end gap-2">

                    {user.status === "PENDING" && (

                      <form action={approveUser}>

                        <input
                          type="hidden"
                          name="userId"
                          value={user.id}
                        />

                        <button
                          type="submit"
                          className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                        >
                          Approve
                        </button>

                      </form>

                    )}


                    {user.status === "ACTIVE" &&
                      user.id !== session.user.id && (

                      <form action={disableUser}>

                        <input
                          type="hidden"
                          name="userId"
                          value={user.id}
                        />

                        <button
                          type="submit"
                          className="rounded-md border border-input px-3 py-2 text-xs font-medium hover:bg-muted"
                        >
                          Disable
                        </button>

                      </form>

                    )}


                    {user.status === "DISABLED" && (

                      <form action={enableUser}>

                        <input
                          type="hidden"
                          name="userId"
                          value={user.id}
                        />

                        <button
                          type="submit"
                          className="rounded-md border border-input px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30"
                        >
                          Enable
                        </button>

                      </form>

                    )}


                    {user.id !== session.user.id &&
                      user.role === "USER" && (

                      <form action={makeAdmin}>

                        <input
                          type="hidden"
                          name="userId"
                          value={user.id}
                        />

                        <button
                          type="submit"
                          className="rounded-md border border-input px-3 py-2 text-xs font-medium hover:bg-muted"
                        >
                          Make Admin
                        </button>

                      </form>

                    )}


                    {user.id !== session.user.id &&
                      user.role === "ADMIN" && (

                      <form action={makeUser}>

                        <input
                          type="hidden"
                          name="userId"
                          value={user.id}
                        />

                        <button
                          type="submit"
                          className="rounded-md border border-input px-3 py-2 text-xs font-medium hover:bg-muted"
                        >
                          Make User
                        </button>

                      </form>

                    )}

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}