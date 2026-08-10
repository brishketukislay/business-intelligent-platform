import Link from "next/link";

import {
  registerUser,
} from "./actions";


export default function RegisterPage() {

  return (

    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">

      <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">

        <div className="mb-8 space-y-2">

          <h1 className="text-2xl font-semibold">
            Request access
          </h1>

          <p className="text-sm text-muted-foreground">
            Create an account request. An administrator must approve
            your account before you can sign in.
          </p>

        </div>


        <form
          action={registerUser}
          className="space-y-5"
        >

          <div className="space-y-2">

            <label
              htmlFor="name"
              className="text-sm font-medium"
            >
              Name
            </label>


            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />

          </div>


          <div className="space-y-2">

            <label
              htmlFor="email"
              className="text-sm font-medium"
            >
              Email
            </label>


            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />

          </div>


          <div className="space-y-2">

            <label
              htmlFor="password"
              className="text-sm font-medium"
            >
              Password
            </label>


            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />


            <p className="text-xs text-muted-foreground">
              Minimum 12 characters.
            </p>

          </div>


          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Request access
          </button>

        </form>


        <div className="mt-6 border-t pt-6 text-center text-sm text-muted-foreground">

          Already have an account?{" "}

          <Link
            href="/login"
            className="font-medium text-foreground hover:underline"
          >
            Sign in
          </Link>

        </div>

      </div>

    </main>

  );

}
