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

  const session = await auth();


  if (!session?.user?.id) {
    redirect("/login");
  }


  return (

    <div
      className="
        flex
        min-h-screen
      "
    >

      <Sidebar />


      <div
        className="
          flex
          flex-1
          flex-col
        "
      >

        <Header />


        <main
          className="
            flex-1
            bg-gray-50
            p-6
          "
        >

          {children}

        </main>

      </div>

    </div>

  );

}
