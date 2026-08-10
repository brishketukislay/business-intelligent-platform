import {
  requireCurrentUser,
} from "@/lib/current-user";


export default async function SettingsPage() {

  const user =
    await requireCurrentUser();


  return (

    <div className="space-y-8">

      <div>

        <h1 className="text-2xl font-semibold tracking-tight">
          Settings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and application preferences.
        </p>

      </div>


      {/* Account */}

      <section className="rounded-lg border bg-background">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold">
            Account
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your account information.
          </p>

        </div>


        <div className="space-y-5 p-6">

          <div>

            <p className="text-sm font-medium">
              Name
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {user.name ?? "Not provided"}
            </p>

          </div>


          <div>

            <p className="text-sm font-medium">
              Email
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {user.email}
            </p>

          </div>


          <div>

            <p className="text-sm font-medium">
              Role
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {user.role ?? "User"}
            </p>

          </div>

        </div>

      </section>


      {/* Application Preferences */}

      <section className="rounded-lg border bg-background">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold">
            Application Preferences
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Default preferences used when working with financial models.
          </p>

        </div>


        <div className="divide-y">

          <div className="flex items-center justify-between gap-6 p-6">

            <div>

              <p className="text-sm font-medium">
                Default currency
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Currency used for financial model values.
              </p>

            </div>


            <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">
              GBP (£)
            </div>

          </div>


          <div className="flex items-center justify-between gap-6 p-6">

            <div>

              <p className="text-sm font-medium">
                Default working weeks
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Default number of working weeks used in annual calculations.
              </p>

            </div>


            <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">
              52 weeks
            </div>

          </div>

        </div>

      </section>


      {/* About */}

      <section className="rounded-lg border bg-background">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold">
            About
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Business intelligence and financial modelling platform.
          </p>

        </div>


        <div className="p-6">

          <div className="flex items-center justify-between gap-6">

            <div>

              <p className="text-sm font-medium">
                Platform
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Configurable Business Intelligence Modelling Platform
              </p>

            </div>


            <div className="text-sm text-muted-foreground">
              v1.0
            </div>

          </div>

        </div>

      </section>

    </div>

  );

}