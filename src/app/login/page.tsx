"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  signIn,
} from "next-auth/react";

import {
  Eye,
  EyeOff,
} from "lucide-react";


export default function LoginPage() {

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");


    const formData =
      new FormData(event.currentTarget);


    const email =
      String(
        formData.get("email") || ""
      );

    const password =
      String(
        formData.get("password") || ""
      );


    const result =
      await signIn(
        "credentials",
        {
          email,
          password,
          redirect: false,
        }
      );


    if (
      !result ||
      result.error
    ) {

      setError(
        "Invalid email or password, or your account has not been approved yet."
      );

      return;

    }


    window.location.href =
      "/models";

  }


  return (

    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-muted/40
        p-6
      "
    >

      <div
        className="
          w-full
          max-w-md
          rounded-xl
          border
          bg-background
          p-8
          shadow-sm
        "
      >

        <div className="mb-8 space-y-2">

          <h1 className="text-2xl font-semibold">
            Sign in
          </h1>

          <p className="text-sm text-muted-foreground">
            Sign in to your BI Finance Modelling Platform account.
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
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
              placeholder="you@example.com"
              className="
                flex
                h-10
                w-full
                rounded-md
                border
                border-input
                bg-background
                px-3
                py-2
                text-sm
                outline-none
                focus-visible:border-ring
                focus-visible:ring-2
                focus-visible:ring-ring/30
              "
            />

          </div>


          <div className="space-y-2">

            <label
              htmlFor="password"
              className="text-sm font-medium"
            >
              Password
            </label>


            <div className="relative">

              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="
                  flex
                  h-10
                  w-full
                  rounded-md
                  border
                  border-input
                  bg-background
                  px-3
                  py-2
                  pr-10
                  text-sm
                  outline-none
                  focus-visible:border-ring
                  focus-visible:ring-2
                  focus-visible:ring-ring/30
                "
              />


              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="
                  absolute
                  right-2
                  top-1/2
                  -translate-y-1/2
                  rounded-md
                  p-1.5
                  text-muted-foreground
                  hover:bg-muted
                  hover:text-foreground
                "
              >

                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}

              </button>

            </div>


            <div className="text-right">

              <Link
                href="/forgot-password"
                className="
                  text-sm
                  text-muted-foreground
                  hover:text-foreground
                  hover:underline
                "
              >
                Forgot password?
              </Link>

            </div>

          </div>


          {error && (

            <div
              className="
                rounded-md
                border
                border-destructive/30
                bg-destructive/10
                px-3
                py-2
                text-sm
                text-destructive
              "
            >
              {error}
            </div>

          )}


          <button
            type="submit"
            className="
              inline-flex
              h-10
              w-full
              items-center
              justify-center
              rounded-md
              bg-primary
              px-4
              py-2
              text-sm
              font-medium
              text-primary-foreground
              hover:bg-primary/90
            "
          >
            Sign in
          </button>

        </form>


        <div className="mt-6 text-center">

          <p className="text-sm text-muted-foreground">
            Don't have an account?
          </p>

          <Link
            href="/request-access"
            className="
              mt-1
              inline-block
              text-sm
              font-medium
              text-primary
              hover:underline
            "
          >
            Request access
          </Link>

        </div>

      </div>

    </main>

  );

}
