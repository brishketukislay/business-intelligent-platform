"use client";

import {
  useState,
} from "react";

import {
  createScenarioAction,
} from "../actions/scenario-actions";

import {
  Button,
} from "@/components/ui/button";


export function ScenarioForm({
  modelId,
}: {
  modelId: string;
}) {

  const [
    name,
    setName,
  ] = useState("");


  const [
    description,
    setDescription,
  ] = useState("");


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
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError(null);

    setIsSubmitting(true);


    try {

      const result =
        await createScenarioAction(
          modelId,
          name,
          description
        );


      if (!result.success) {

        setError(
          result.error ??
          "Unable to create scenario."
        );

        return;

      }


      setName("");

      setDescription("");

    } finally {

      setIsSubmitting(false);

    }

  }


  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >

      <div className="space-y-2">

        <label
          htmlFor="scenario-name"
          className="text-sm font-medium"
        >
          Scenario Name
        </label>

        <input
          id="scenario-name"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="e.g. Conservative Case"
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
          disabled={isSubmitting}
        />

      </div>


      <div className="space-y-2">

        <label
          htmlFor="scenario-description"
          className="text-sm font-medium"
        >
          Description
        </label>

        <textarea
          id="scenario-description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="Describe the assumptions for this scenario."
          rows={3}
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
          disabled={isSubmitting}
        />

      </div>


      {error && (

        <p className="text-sm text-destructive">
          {error}
        </p>

      )}


      <Button
        type="submit"
        disabled={
          isSubmitting ||
          !name.trim()
        }
      >

        {isSubmitting
          ? "Creating..."
          : "Create Scenario"}

      </Button>

    </form>

  );

}
