import {
  getBusinessModels,
} from "@/features/models/services/model-service";

import {
  ModelList,
} from "@/features/models/components/model-list";

// import {
//   ModelForm,
// } from "@/features/models/components/model-form";

import {ModelCreateWizard} from "@/features/models/components/model-create-wizard";

import {
  requireCurrentUser,
} from "@/lib/current-user";

export default async function ModelsPage() {
  const user =
    await requireCurrentUser();

  const models =
    await getBusinessModels(
      user.id,
    );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            Performance tracking
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Your trackers
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Track your company, projects, people,
            customers, sales or anything else that
            matters to the business.
          </p>
        </div>

        <ModelCreateWizard />
      </div>

      <ModelList
        models={models}
      />
    </div>
  );
}