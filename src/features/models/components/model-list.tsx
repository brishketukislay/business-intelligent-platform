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

              <Link
                href={`/models/${model.id}`}
                className="inline-flex h-9 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Open Model
              </Link>

            </div>

          </div>

        )
      )}

    </div>

  );

}
