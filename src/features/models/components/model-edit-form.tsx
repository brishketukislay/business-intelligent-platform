"use client";

import { useState } from "react";

import {
  updateBusinessModelAction,
} from "../actions/model-actions";

import {
  MODEL_STATUSES,
  type ModelStatus,
} from "../types";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


type ModelEditFormProps = {
  model: {
    id: string;
    name: string;
    description: string | null;
    status: string;
  };
};


export function ModelEditForm({
  model,
}: ModelEditFormProps) {

  const [
    status,
    setStatus,
  ] = useState<ModelStatus>(
    MODEL_STATUSES.includes(
      model.status as ModelStatus
    )
      ? (model.status as ModelStatus)
      : "ACTIVE"
  );


  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  async function handleSubmit(
    formData: FormData
  ) {

    setIsSubmitting(true);
    setError(null);


    formData.set(
      "status",
      status
    );


    try {

      const result =
        await updateBusinessModelAction(
          model.id,
          formData
        );


      if (!result.success) {

        setError(
          "Unable to update business model."
        );

        return;

      }


      window.location.href =
        `/models/${model.id}`;

    } catch (error) {

      console.error(error);

      setError(
        "An unexpected error occurred."
      );

    } finally {

      setIsSubmitting(false);

    }

  }


  return (

    <form
      action={handleSubmit}
      className="space-y-6"
    >

      <div className="space-y-2">

        <Label htmlFor="model-name">
          Name
        </Label>

        <Input
          id="model-name"
          name="name"
          defaultValue={model.name}
          placeholder="Business Model"
          required
        />

      </div>


      <div className="space-y-2">

        <Label htmlFor="model-description">
          Description
        </Label>

        <Textarea
          id="model-description"
          name="description"
          defaultValue={
            model.description ?? ""
          }
          placeholder="Describe this business model."
          rows={5}
        />

      </div>


      <div className="space-y-2">

        <Label>
          Status
        </Label>

        <Select
          value={status}
          onValueChange={(value) => {

            if (value) {

              setStatus(
                value as ModelStatus
              );

            }

          }}
        >

          <SelectTrigger>

            <SelectValue />

          </SelectTrigger>


          <SelectContent>

            {MODEL_STATUSES.map(
              (modelStatus) => (

                <SelectItem
                  key={modelStatus}
                  value={modelStatus}
                >
                  {modelStatus}
                </SelectItem>

              )
            )}

          </SelectContent>

        </Select>

      </div>


      {error && (

        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">

          <p className="text-sm text-destructive">
            {error}
          </p>

        </div>

      )}


      <div className="flex items-center justify-end gap-3">

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.location.href =
              `/models/${model.id}`;
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>


        <Button
          type="submit"
          disabled={isSubmitting}
        >

          {isSubmitting
            ? "Saving..."
            : "Save Changes"}

        </Button>

      </div>

    </form>

  );

}
