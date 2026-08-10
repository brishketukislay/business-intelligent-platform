import Link from "next/link";
import AnalyticsWorkspace from "@/features/analytics/components/analytics-workspace-client";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  getBusinessModels,
} from "@/features/models/services/model-service";

import {
  getAnalyticsDashboardData,
} from "@/features/analytics/services/analytics-service";

import {
  Badge,
} from "@/components/ui/badge";


export default async function DashboardPage() {
  const user =
    await requireCurrentUser();

  const models =
    await getBusinessModels(
      user.id
    );

  const analytics =
    await getAnalyticsDashboardData(
      user.id
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your business models, scenarios and analytics.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Business Models
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Open a model to configure inputs, metrics and scenarios.
          </p>
        </div>

        <Link
          href="/models"
          className="
            inline-flex
            h-9
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
          Manage Models
        </Link>
      </div>

      {models.length === 0 ? (
        <div className="rounded-lg border bg-background p-8 text-center">
          <h2 className="font-medium">
            No business models yet
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Create your first business model to start building your costing model.
          </p>

          <Link
            href="/models"
            className="
              mt-5
              inline-flex
              h-9
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
            Go to Models
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {models.map(
            model => (
              <div
                key={
                  model.id
                }
                className="
                  rounded-lg
                  border
                  bg-background
                  p-6
                  shadow-sm
                "
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">
                      {
                        model.name
                      }
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {model.description ??
                        "No description provided."}
                    </p>
                  </div>

                  <Badge
                    variant={
                      model.status ===
                      "ACTIVE"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {
                      model.status
                    }
                  </Badge>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/models/${model.id}`}
                    className="
                      inline-flex
                      h-9
                      w-full
                      items-center
                      justify-center
                      rounded-md
                      border
                      border-input
                      bg-background
                      px-4
                      py-2
                      text-sm
                      font-medium
                      shadow-sm
                      hover:bg-accent
                      hover:text-accent-foreground
                    "
                  >
                    Open Model
                  </Link>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {models.length > 0 && (
        <AnalyticsWorkspace
          models={
            analytics.models
          }
          charts={
            analytics.charts
          }
        />
      )}
    </div>
  );
}