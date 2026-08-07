import Link from "next/link";


export default function HomePage() {

  return (

    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
      "
    >

      <div
        className="
          text-center
        "
      >

        <h1
          className="
            text-3xl
            font-bold
          "
        >
          BI Finance Modelling Platform
        </h1>


        <p
          className="
            mt-4
            text-gray-600
          "
        >
          Configuration-driven modelling foundation.
        </p>


        <Link
          href="/dashboard"
          className="
            mt-6
            inline-block
            rounded-md
            bg-black
            px-4
            py-2
            text-white
          "
        >
          Open Dashboard
        </Link>

      </div>

    </main>

  );

}
