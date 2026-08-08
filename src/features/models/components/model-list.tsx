"use client";

import Link from "next/link";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import type {
  BusinessModelRecord,
} from "../types";


type ModelListProps = {
  models: BusinessModelRecord[];
};


export function ModelList({
  models,
}: ModelListProps) {

  if (models.length === 0) {

    return (

      <div className="rounded-lg border bg-background p-8 text-center">

        <h2 className="font-medium">
          No business models
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Create your first business model to get started.
        </p>

      </div>

    );

  }


  return (

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

      {models.map(
        (model) => (

          <div
            key={model.id}
            className="rounded-lg border bg-background p-6 shadow-sm"
          >

            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0">

                <h2 className="truncate font-semibold">
                  {model.name}
                </h2>

                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {model.description ??
                    "No description provided."}
                </p>

              </div>


              <Badge
                variant={
                  model.status === "ACTIVE"
                    ? "default"
                    : "secondary"
                }
              >
                {model.status}
              </Badge>

            </div>


            <div className="mt-6">

              <Button
                variant="outline"
                className="w-full"
              >

                <Link
                  href={`/models/${model.id}`}
                >
                  Open Model
                </Link>

              </Button>

            </div>

          </div>

        )
      )}

    </div>

  );

}
