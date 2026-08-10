"use client";

import dynamic from "next/dynamic";

const AnalyticsWorkspace = dynamic(
() => import("./analytics-workspace"),
{
ssr: false,
loading: () => ( <div className="rounded-lg border bg-background p-6"> <div className="space-y-3"> <div className="h-5 w-40 animate-pulse rounded bg-muted" /> <div className="h-4 w-72 animate-pulse rounded bg-muted" /> <div className="h-[320px] animate-pulse rounded-md bg-muted/50" /> </div> </div>
),
}
);

export default AnalyticsWorkspace;
