"use client";

import {
  ModelActionDialog,
} from "./model-action-dialog";

import {
  ModelEditForm,
} from "./model-edit-form";

import {
  Button,
} from "@/components/ui/button";


type ModelEditDialogProps = {
  model: {
    id: string;
    name: string;
    description: string | null;
    status: string;
  };
};


export function ModelEditDialog({
  model,
}: ModelEditDialogProps) {

  return (

    <ModelActionDialog

      trigger={

        <Button
          type="button"
          variant="outline"
          className="
            border-slate-300
            bg-white
            text-slate-900
            hover:bg-slate-50
          "
        >
          Edit Model
        </Button>

      }

      title="Edit Business Model"

      description="
        Update the configuration for this business model.
      "
    >

      <ModelEditForm
        model={model}
      />

    </ModelActionDialog>

  );

}
