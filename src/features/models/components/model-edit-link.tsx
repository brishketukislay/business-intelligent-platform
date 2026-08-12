"use client";

import Link from "next/link";

type ModelEditLinkProps = {
  modelId: string;
};

export function ModelEditLink({
  modelId,
}: ModelEditLinkProps) {
  return (
    <Link
      href={`/models/${modelId}/edit`}
      className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      Edit Model
    </Link>
  );
}