import Link from "next/link";

import {
  Badge,
} from "@/components/ui/badge";


type ScenarioListItem = {

  id: string;

  name: string;

  description: string | null;

  status: string;

  createdAt: Date;

  values: {
    id: string;
  }[];

};


export function ScenarioList({
  modelId,
  scenarios,
}: {
  modelId: string;
  scenarios: ScenarioListItem[];
}) {

  if (scenarios.length === 0) {

    return (

      <div className="rounded-lg border bg-background p-8">

        <h2 className="font-semibold">
          No scenarios yet
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Create your first scenario to model different assumptions.
        </p>

      </div>

    );

  }


  return (

    <div className="space-y-4">

      {scenarios.map(
        (scenario) => (

          <Link
            key={scenario.id}
            href={`/models/${modelId}/scenarios/${scenario.id}`}
            className="
              block
              rounded-lg
              border
              bg-background
              p-6
              shadow-sm
              transition-colors
              hover:bg-muted/50
            "
          >

            <div className="flex items-start justify-between gap-6">

              <div>

                <h2 className="font-semibold">
                  {scenario.name}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {scenario.description ??
                    "No description provided."}
                </p>

                <p className="mt-3 text-xs text-muted-foreground">
                  Created{" "}
                  {scenario.createdAt.toLocaleString()}
                </p>

              </div>


              <div className="flex items-center gap-2">

                <Badge
                  variant={
                    scenario.status === "ACTIVE"
                      ? "default"
                      : "secondary"
                  }
                >
                  {scenario.status}
                </Badge>

                <Badge variant="outline">

                  {scenario.values.length}

                  {" "}

                  {scenario.values.length === 1
                    ? "value"
                    : "values"}

                </Badge>

              </div>

            </div>

          </Link>

        )
      )}

    </div>

  );

}
