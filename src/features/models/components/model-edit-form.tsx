"use client";

import { useState } from "react";

import type { BusinessModel } from "@prisma/client";

import { useRouter } from "next/navigation";

import {
  Check,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  updateBusinessModelAction,
} from "../actions/model-actions";

type Props = {
  model: BusinessModel;
};

export function ModelEditForm({
  model,
}: Props) {
  const router = useRouter();

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function submit(
    formData: FormData,
  ) {
    setSaving(true);
    setError(null);

    try {
      const result =
        await updateBusinessModelAction(
          model.id,
          formData,
        );

      if (!result.success) {
        setError(
          "Unable to save the model. Please check the fields and try again.",
        );
        return;
      }

      router.push(
        `/models/${model.id}`,
      );

      router.refresh();
    } catch (submitError) {
      console.error(
        "Failed to update model:",
        submitError,
      );

      setError(
        "Something went wrong while saving the model.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      action={submit}
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
          placeholder="Model name"
          disabled={saving}
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
          placeholder="Describe what this model tracks."
          rows={4}
          disabled={saving}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="item-label-singular">
            Singular item label
          </Label>

          <Input
            id="item-label-singular"
            name="itemLabelSingular"
            defaultValue={
              model.itemLabelSingular
            }
            placeholder="Item"
            disabled={saving}
            required
          />

          <p className="text-xs text-muted-foreground">
            Used when referring to one tracked item.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="item-label-plural">
            Plural item label
          </Label>

          <Input
            id="item-label-plural"
            name="itemLabelPlural"
            defaultValue={
              model.itemLabelPlural
            }
            placeholder="Items"
            disabled={saving}
            required
          />

          <p className="text-xs text-muted-foreground">
            Used for lists and navigation.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="model-status">
          Status
        </Label>

        <select
          id="model-status"
          name="status"
          defaultValue={model.status}
          disabled={saving}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="ACTIVE">
            Active
          </option>

          <option value="INACTIVE">
            Inactive
          </option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="mr-2 size-4" />
              Save changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}