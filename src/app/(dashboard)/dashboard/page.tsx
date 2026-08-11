import {
requireCurrentUser,
} from "@/lib/current-user";

import {
getAnalyticsDashboardData,
} from "@/features/analytics/services/analytics-service";

import AnalyticsWorkspace from "@/features/analytics/components/analytics-workspace-client";

export default async function DashboardPage() {
const user =
await requireCurrentUser();

const analytics =
await getAnalyticsDashboardData(
user.id
);

return ( <div className="space-y-8"> <div> <h1 className="text-2xl font-semibold tracking-tight">
Dashboard </h1>
    <p className="mt-1 text-sm text-muted-foreground">
      Your saved business analytics.
    </p>
  </div>

  <AnalyticsWorkspace
    models={
      analytics.models
    }
    charts={
      analytics.charts
    }
  />
</div>

);
}
