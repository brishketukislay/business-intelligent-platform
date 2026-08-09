import {
  getBusinessModels,
} from "@/features/models/services/model-service";

import {
  ModelList,
} from "@/features/models/components/model-list";

import {
  ModelForm,
} from "@/features/models/components/model-form";

import {
  requireCurrentUser,
} from "@/lib/current-user";


export default async function ModelsPage() {

  const user =
    await requireCurrentUser();


  const models =
    await getBusinessModels(
      user.id
    );


  return (

    <div className="space-y-8">

      <div className="flex items-start justify-between gap-4">

        <div className="space-y-1">

          <h1 className="text-2xl font-semibold tracking-tight">
            Business Models
          </h1>

          <p className="text-sm text-muted-foreground">
            Configure and manage business models.
          </p>

        </div>

        <ModelForm />

      </div>


      <ModelList
        models={models}
      />

    </div>

  );

}
