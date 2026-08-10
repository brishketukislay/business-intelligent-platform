import { redirect } from "next/navigation";

import { auth } from "@/auth";

import {
Sidebar,
} from "@/components/layout/sidebar";

import {
Header,
} from "@/components/layout/header";

export default async function DashboardLayout({
children,
}: {
children: React.ReactNode;
}) {

const session =
await auth();

if (!session?.user?.id) {
redirect("/login");
}

return (

<div
  className="
    flex
    min-h-screen
    w-full
  "
>

  <Sidebar />


  <div
    className="
      flex
      min-w-0
      flex-1
      flex-col
    "
  >

    <Header />


    <main
      className="
        min-w-0
        flex-1
        bg-gray-50
        p-4
        sm:p-6
      "
    >

      {children}

    </main>

  </div>

</div>


);

}