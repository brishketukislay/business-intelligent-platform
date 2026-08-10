"use client";

import {
  signOut,
} from "next-auth/react";


export function Header() {

  return (

    <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">

      <div className="min-w-0">

        <h1 className="truncate text-sm font-medium">
          BI Finance Modelling Platform
        </h1>

      </div>


      <button
        type="button"
        onClick={() =>
          signOut({
            callbackUrl: "/login",
          })
        }
        className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-100"
      >
        Sign out
      </button>

    </header>

  );

}
