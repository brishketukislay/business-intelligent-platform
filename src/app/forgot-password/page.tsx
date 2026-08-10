"use client";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  requestPasswordReset,
} from "./actions";


export default function ForgotPasswordPage() {

  const [
    resetLink,
    setResetLink,
  ] = useState<string | null>(null);


  const [
    submitted,
    setSubmitted,
  ] = useState(false);


  return (

    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">

      <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">

        <div className="mb-8 space-y-2">

          <h1 className="text-2xl font-semibold">
            Forgot password
          </h1>

          <p className="text-sm text-muted-foreground">
            Enter your account email to generate a password reset link.
          </p>

        </div>


        <form
          action={async (formData) => {

            const result =
              await requestPasswordReset(
                formData
              );


            setSubmitted(true);

            setResetLink(
              result.resetLink ?? null
            );

          }}

          className="space-y-5"
        >

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


          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Generate reset link
          </button>

        </form>


        {submitted && (

          <div className="mt-6 rounded-lg border bg-muted/30 p-4">

            <p className="text-sm">

              If an account exists for that email, a reset
              link has been generated.

            </p>


            {resetLink && (

              <div className="mt-4 space-y-2">

                <p className="text-xs font-medium text-muted-foreground">
                  Development reset link
                </p>


                <Link
                  href={resetLink}
                  className="break-all text-sm text-primary hover:underline"
                >
                  {resetLink}
                </Link>


                <p className="text-xs text-muted-foreground">
                  This development link will later be replaced
                  by email delivery.
                </p>

              </div>

            )}

          </div>

        )}


        <div className="mt-6 text-center text-sm">

          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to sign in
          </Link>

        </div>

      </div>

    </main>

  );

}
