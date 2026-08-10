"use client";

import { useState } from "react";

import { createInputAction } from "../actions/input-actions";
import {
  INPUT_TYPES,
  type InputType,
} from "../types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


type InputScope =
  | "MODEL"
  | "PERIOD";


export function InputForm({
  modelId,
}: {
  modelId: string;
}) {

  const [
    type,
    setType,
  ] = useState<InputType>("Number");


  const [
    scope,
    setScope,
  ] = useState<InputScope>("MODEL");


  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);


  const [
    message,
    setMessage,
  ] = useState<string | null>(null);


  async function submit(
    formData: FormData
  ) {

    setIsSubmitting(true);
    setMessage(null);


    formData.set(
      "modelId",
      modelId
    );


    formData.set(
      "type",
      type
    );


    formData.set(
      "scope",
      scope
    );


    try {

      const result =
        await createInputAction(
          formData
        );


      if (result.success) {

        setMessage(
          "Input definition created successfully."
        );


        window.location.reload();

        return;

      }


      setMessage(
        typeof result.error === "string"
          ? result.error
          : "Unable to create input definition."
      );

    } catch (error) {

      console.error(error);

      setMessage(
        "An unexpected error occurred."
      );

    } finally {

      setIsSubmitting(false);

    }

  }


  return (

    <form
      action={submit}
      className="space-y-5"
    >

      <input
        type="hidden"
        name="modelId"
        value={modelId}
      />


      {/* Name */}

      <div className="space-y-2">

        <Label htmlFor="input-name">
          Name
        </Label>

        <Input
          id="input-name"
          name="name"
          placeholder="e.g. Annual Target"
          required
        />

      </div>


      {/* Key */}

      <div className="space-y-2">

        <Label htmlFor="input-key">
          Key
        </Label>

        <Input
          id="input-key"
          name="key"
          placeholder="e.g. annual_target"
          required
        />

        <p className="text-xs text-muted-foreground">
          Use lowercase letters, numbers and underscores.
        </p>

      </div>


      {/* Type */}

      <div className="space-y-2">

        <Label>
          Type
        </Label>

        <Select
          value={type}
          onValueChange={(value) => {

            if (value) {

              setType(
                value as InputType
              );

            }

          }}
        >

          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>


          <SelectContent>

            {INPUT_TYPES.map(
              inputType => (

                <SelectItem
                  key={inputType}
                  value={inputType}
                >
                  {inputType}
                </SelectItem>

              )
            )}

          </SelectContent>

        </Select>


        <input
          type="hidden"
          name="type"
          value={type}
        />

      </div>


      {/* Scope */}

      <div className="space-y-2">

        <Label>
          Value Scope
        </Label>

        <Select
          value={scope}
          onValueChange={(value) => {

            if (
              value === "MODEL" ||
              value === "PERIOD"
            ) {

              setScope(value);

            }

          }}
        >

          <SelectTrigger>
            <SelectValue placeholder="Select value scope" />
          </SelectTrigger>


          <SelectContent>

            <SelectItem value="MODEL">
              Model Level
            </SelectItem>

            <SelectItem value="PERIOD">
              Monthly / Period
            </SelectItem>

          </SelectContent>

        </Select>


        <input
          type="hidden"
          name="scope"
          value={scope}
        />


        <p className="text-xs text-muted-foreground">

          {scope === "PERIOD"
            ? "This input will have a separate value for each model period."
            : "This input has one model-level value."
          }

        </p>

      </div>


      {/* Unit */}

      <div className="space-y-2">

        <Label htmlFor="input-unit">
          Unit
        </Label>

        <Input
          id="input-unit"
          name="unit"
          placeholder="e.g. hours, GBP, GBP/hr"
        />

      </div>


      {/* Category */}

      <div className="space-y-2">

        <Label htmlFor="input-category">
          Category
        </Label>

        <Input
          id="input-category"
          name="category"
          placeholder="e.g. Targets, Actuals, Costs"
        />

      </div>


      {/* Submit */}

      <Button
        type="submit"
        disabled={isSubmitting}
      >

        {isSubmitting
          ? "Creating..."
          : "Create Input"
        }

      </Button>


      {message && (

        <p className="text-sm text-muted-foreground">
          {message}
        </p>

      )}

    </form>

  );

}