"use client";

import {
  useState,
} from "react";

import {
  createInputAction,
} from "../actions/input-actions";

import {
  INPUT_TYPES,
  type InputType,
} from "../types";

import {
  generateUniqueKey,
} from "@/lib/key-utils";

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
    name,
    setName,
  ] = useState("");

  const [
    type,
    setType,
  ] = useState<InputType>(
    "Number"
  );

  const [
    scope,
    setScope,
  ] = useState<InputScope>(
    "MODEL"
  );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState<string | null>(
    null
  );

  const generatedKey =
    generateUniqueKey(
      name || "item",
      []
    );

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

    /*
     * The generated key is submitted, but the
     * server remains authoritative and will
     * regenerate it if necessary.
     */
    formData.set(
      "key",
      generatedKey
    );

    try {
      const result =
        await createInputAction(
          formData
        );

      if (result.success) {
        setMessage(
          `Input created. Key: ${result.key}`
        );

        window.location.reload();

        return;
      }

      setMessage(
        typeof result.error ===
          "string"
          ? result.error
          : "Unable to create input definition."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to create input definition. Please try again."
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

      <div className="space-y-2">
        <Label htmlFor="input-name">
          Name
        </Label>

        <Input
          id="input-name"
          name="name"
          placeholder="e.g. Annual Target"
          value={name}
          onChange={(event) =>
            setName(
              event.target.value
            )
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          System key
        </Label>

        <Input
          value={
            name
              ? generatedKey
              : "Start typing a name..."
          }
          readOnly
          tabIndex={-1}
          className="bg-muted/40 font-mono text-sm"
        />

        <p className="text-xs text-muted-foreground">
          This is generated automatically and
          is used internally by formulas. You
          don't need to remember it.
        </p>
      </div>

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
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {INPUT_TYPES.map(
              (inputType) => (
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
            <SelectValue />
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
            : "This input has one model-level value."}
        </p>
      </div>

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

      <Button
        type="submit"
        disabled={
          isSubmitting ||
          !name.trim()
        }
      >
        {isSubmitting
          ? "Creating..."
          : "Create Input"}
      </Button>

      {message && (
        <p className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </form>
  );
}