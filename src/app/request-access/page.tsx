"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  Eye,
  EyeOff,
} from "lucide-react";


export default function RequestAccessPage() {

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");
    setMessage("");


    const form =
      event.currentTarget;

    const formData =
      new FormData(form);


    const response =
      await fetch(
        "/api/auth/request-access",
        {
          method: "POST",
          body: formData,
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      setError(
        data.error ||
        "Unable to submit request."
      );

      return;

    }


    setMessage(
      "Your access request has been submitted. An administrator must approve your account before you can sign in."
    );

    form.reset();

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
            Request access
          </h1>

          <p className="text-sm text-muted-foreground">
            Create your account request. An administrator will
            review and approve it before you can sign in.
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
                minLength={8}
                autoComplete="new-password"
                placeholder="Create a password"
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


            <p className="text-xs text-muted-foreground">
              Use at least 8 characters.
            </p>

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


          {message && (

            <div
              className="
                rounded-md
                border
                border-green-500/30
                bg-green-500/10
                px-3
                py-2
                text-sm
                text-green-700
              "
            >
              {message}
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
            Request access
          </button>

        </form>


        <div className="mt-6 text-center">

          <Link
            href="/login"
            className="
              text-sm
              text-muted-foreground
              hover:text-foreground
              hover:underline
            "
          >
            Back to sign in
          </Link>

        </div>

      </div>

    </main>

  );

}
