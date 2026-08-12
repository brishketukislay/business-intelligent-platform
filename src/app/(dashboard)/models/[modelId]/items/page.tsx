import {
  notFound,
} from "next/navigation";

import {
  requireCurrentUser,
} from "@/lib/current-user";

import {
  getModelItemDashboard,
} from "@/features/models/items/model-item-service";

import {
  ModelItemsDashboard,
} from "@/features/models/items/model-items-dashboard";

type Props = {
  params: Promise<{
    modelId: string;
  }>;
};

export default async function ModelItemsPage({
  params,
}: Props) {
  const {
    modelId,
  } = await params;

  if (!modelId) {
    notFound();
  }

  const user =
    await requireCurrentUser();

  const data =
    await getModelItemDashboard(
      modelId,
      user.id
    );

  if (!data) {
    notFound();
  }

  return (
    <ModelItemsDashboard
      data={data}
    />
  );
}