"use client";

import { useState } from "react";

import { createInputAction } from "../actions/input-actions";
import { INPUT_TYPES, type InputType } from "../types";

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

export function InputForm({
  modelId,
}: {
  modelId: string;
}) {
  const [type, setType] = useState<InputType>("Number");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await createInputAction(formData);

      if (result.success) {
        setMessage("Input definition created successfully.");
      } else {
        setMessage("Unable to create input definition.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={submit} className="space-y-5">
      <input
        type="hidden"
        name="modelId"
        value={modelId}
      />

      <div className="space-y-2">
        <Label htmlFor="name">
          Name
        </Label>

        <Input
          id="name"
          name="name"
          placeholder="Customer Count"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="key">
          Key
        </Label>

        <Input
          id="key"
          name="key"
          placeholder="customer_count"
          required
        />

        <p className="text-xs text-muted-foreground">
          Use lowercase letters, numbers and underscores.
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
              setType(value as InputType);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>

          <SelectContent>
            {INPUT_TYPES.map((inputType) => (
              <SelectItem
                key={inputType}
                value={inputType}
              >
                {inputType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          type="hidden"
          name="type"
          value={type}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">
          Unit
        </Label>

        <Input
          id="unit"
          name="unit"
          placeholder="customers"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">
          Category
        </Label>

        <Input
          id="category"
          name="category"
          placeholder="Operations"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
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
