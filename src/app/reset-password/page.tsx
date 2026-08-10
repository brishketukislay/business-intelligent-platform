import Link from "next/link";

import {
  resetPassword,
} from "./actions";


type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};


export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {

  const {
    token,
  } = await searchParams;


  if (!token) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">

        <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">

          <h1 className="text-xl font-semibold">
            Invalid reset link
          </h1>


          <p className="mt-2 text-sm text-muted-foreground">
            This password reset link is missing or invalid.
          </p>


          <Link
            href="/forgot-password"
            className="mt-6 inline-block text-sm text-primary hover:underline"
          >
            Request another reset link
          </Link>

        </div>

      </main>

    );

  }


  return (

    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">

      <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">

        <div className="mb-8 space-y-2">

          <h1 className="text-2xl font-semibold">
            Set new password
          </h1>

          <p className="text-sm text-muted-foreground">
            Choose a new password for your account.
          </p>

        </div>


        <form
          action={resetPassword}
          className="space-y-5"
        >

          <input
            type="hidden"
            name="token"
            value={token}
          />


          <div className="space-y-2">

            <label
              htmlFor="password"
              className="text-sm font-medium"
            >
              New password
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

          </div>


          <div className="space-y-2">

            <label
              htmlFor="confirmation"
              className="text-sm font-medium"
            >
              Confirm password
            </label>


            <input
              id="confirmation"
              name="confirmation"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />

          </div>


          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Set password
          </button>

        </form>

      </div>

    </main>

  );

}
