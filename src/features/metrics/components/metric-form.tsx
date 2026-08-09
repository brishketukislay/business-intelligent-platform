"use client";

import { useState } from "react";

import {
  createMetricAction,
} from "../actions/metric-actions";

import {
  METRIC_TYPES,
  type MetricDefinitionInput,
} from "../schemas/metric-schema";

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


export function MetricForm({
  modelId,
}: {
  modelId: string;
}) {

  const [
    type,
    setType,
  ] = useState<MetricDefinitionInput["type"]>(
    "Number"
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


  async function submit(
    formData: FormData
  ) {

    setIsSubmitting(true);

    setMessage(null);


    try {

      const result =
        await createMetricAction(
          formData
        );


      if (result.success) {

        setMessage(
          "Metric definition created successfully."
        );

        return;

      }


      setMessage(
        "Unable to create metric definition."
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


      <div className="space-y-2">

        <Label htmlFor="metric-name">
          Name
        </Label>

        <Input
          id="metric-name"
          name="name"
          placeholder="Revenue"
          required
        />

      </div>


      <div className="space-y-2">

        <Label htmlFor="metric-key">
          Key
        </Label>

        <Input
          id="metric-key"
          name="key"
          placeholder="revenue"
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

              setType(
                value as MetricDefinitionInput["type"]
              );

            }

          }}
        >

          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>

          <SelectContent>

            {METRIC_TYPES.map(
              (metricType) => (

                <SelectItem
                  key={metricType}
                  value={metricType}
                >
                  {metricType}
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

        <Label htmlFor="metric-unit">
          Unit
        </Label>

        <Input
          id="metric-unit"
          name="unit"
          placeholder="GBP"
        />

      </div>


      <div className="space-y-2">

        <Label htmlFor="metric-category">
          Category
        </Label>

        <Input
          id="metric-category"
          name="category"
          placeholder="Financial"
        />

      </div>


      <div className="space-y-2">

        <Label htmlFor="metric-formula">
          Formula
        </Label>

        <Input
          id="metric-formula"
          name="formula"
          placeholder="customer_count * price"
          required
        />

        <p className="text-xs text-muted-foreground">
          Formula syntax will be validated when the calculation engine is added.
        </p>

      </div>


      <Button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Creating..."
          : "Create Metric"}
      </Button>


      {message && (

        <p className="text-sm text-muted-foreground">
          {message}
        </p>

      )}

    </form>

  );

}
