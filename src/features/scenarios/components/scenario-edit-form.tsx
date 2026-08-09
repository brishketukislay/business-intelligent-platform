"use client";

import {
  useState,
} from "react";

import {
  updateScenarioAction,
  deactivateScenarioAction,
} from "../actions/scenario-actions";

import {
  Button,
} from "@/components/ui/button";


export function ScenarioEditForm({
  modelId,
  scenarioId,
  initialName,
  initialDescription,
  status,
}: {
  modelId: string;
  scenarioId: string;
  initialName: string;
  initialDescription: string;
  status: string;
}) {

  const [
    name,
    setName,
  ] = useState(initialName);

  const [
    description,
    setDescription,
  ] = useState(initialDescription);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    isDeactivating,
    setIsDeactivating,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState<string | null>(null);


  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setMessage(null);
    setIsSaving(true);

    try {

      const result =
        await updateScenarioAction(
          modelId,
          scenarioId,
          name,
          description
        );

      if (result.success) {

        setMessage("Scenario updated.");

      } else {

        setMessage(
          result.error ??
          "Unable to update scenario."
        );

      }

    } catch (error) {

      console.error(error);

      setMessage(
        "An unexpected error occurred."
      );

    } finally {

      setIsSaving(false);

    }

  }


  async function handleDeactivate() {

    if (
      !window.confirm(
        "Deactivate this scenario?"
      )
    ) {
      return;
    }

    setMessage(null);
    setIsDeactivating(true);

    try {

      const result =
        await deactivateScenarioAction(
          modelId,
          scenarioId
        );

      if (result.success) {

        setMessage(
          "Scenario deactivated."
        );

      } else {

        setMessage(
          result.error ??
          "Unable to deactivate scenario."
        );

      }

    } catch (error) {

      console.error(error);

      setMessage(
        "An unexpected error occurred."
      );

    } finally {

      setIsDeactivating(false);

    }

  }


  return (

    <div className="rounded-lg border bg-background p-6">

      <div className="mb-6">

        <h2 className="font-semibold">
          Scenario Settings
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Update the scenario name and description.
        </p>

      </div>


      <form
        onSubmit={handleSave}
        className="space-y-5"
      >

        <div className="space-y-2">

          <label
            htmlFor="scenario-edit-name"
            className="text-sm font-medium"
          >
            Scenario Name
          </label>

          <input
            id="scenario-edit-name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            disabled={
              isSaving ||
              isDeactivating ||
              status !== "ACTIVE"
            }
            className="
              flex
              h-9
              w-full
              rounded-md
              border
              border-input
              bg-background
              px-3
              py-1
              text-sm
              shadow-sm
              outline-none
              focus:ring-2
              focus:ring-ring
            "
          />

        </div>


        <div className="space-y-2">

          <label
            htmlFor="scenario-edit-description"
            className="text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id="scenario-edit-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            rows={4}
            disabled={
              isSaving ||
              isDeactivating ||
              status !== "ACTIVE"
            }
            className="
              flex
              w-full
              rounded-md
              border
              border-input
              bg-background
              px-3
              py-2
              text-sm
              shadow-sm
              outline-none
              focus:ring-2
              focus:ring-ring
            "
          />

        </div>


        {message && (

          <p className="text-sm text-muted-foreground">
            {message}
          </p>

        )}


        <div className="flex flex-wrap gap-3">

          <Button
            type="submit"
            disabled={
              isSaving ||
              isDeactivating ||
              status !== "ACTIVE" ||
              !name.trim()
            }
          >

            {isSaving
              ? "Saving..."
              : "Save Changes"}

          </Button>


          {status === "ACTIVE" && (

            <Button
              type="button"
              variant="destructive"
              disabled={
                isSaving ||
                isDeactivating
              }
              onClick={handleDeactivate}
            >

              {isDeactivating
                ? "Deactivating..."
                : "Deactivate Scenario"}

            </Button>

          )}

        </div>

      </form>

    </div>

  );

}