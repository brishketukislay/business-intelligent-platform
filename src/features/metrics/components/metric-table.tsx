"use client";

import { useState } from "react";

import {
  deactivateMetricAction,
  updateMetricAction,
} from "../actions/metric-actions";

import {
  METRIC_TYPES,
  type MetricDefinitionInput,
} from "../schemas/metric-schema";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


type MetricRecord = {

  id: string;

  modelId: string;

  name: string;

  key: string;

  type: string;

  unit: string | null;

  category: string | null;

  formula: string;

  status: string;

};


type MetricTableProps = {

  metrics: MetricRecord[];

};


export function MetricTable({
  metrics,
}: MetricTableProps) {

  const [
    editingMetric,
    setEditingMetric,
  ] = useState<MetricRecord | null>(
    null
  );


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


  function openEdit(
    metric: MetricRecord
  ) {

    setEditingMetric(metric);

    setType(
      metric.type as MetricDefinitionInput["type"]
    );

    setMessage(null);

  }


  async function handleEdit(
    formData: FormData
  ) {

    if (!editingMetric) {
      return;
    }


    setIsSubmitting(true);

    setMessage(null);


    try {

      const result =
        await updateMetricAction(
          editingMetric.id,
          formData
        );


      if (result.success) {

        setEditingMetric(null);

        window.location.reload();

        return;

      }


      setMessage(
        "Unable to update metric definition."
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


  async function handleDeactivate(
    metric: MetricRecord
  ) {

    const confirmed =
      window.confirm(
        "Deactivate this metric definition?"
      );


    if (!confirmed) {
      return;
    }


    setMessage(null);


    try {

      const result =
        await deactivateMetricAction(
          metric.id,
          metric.modelId
        );


      if (result.success) {

        window.location.reload();

        return;

      }


      setMessage(
        "Unable to deactivate metric definition."
      );

    } catch (error) {

      console.error(error);

      setMessage(
        "An unexpected error occurred."
      );

    }

  }


  if (metrics.length === 0) {

    return (

      <div className="text-sm text-muted-foreground">
        No metric definitions created yet.
      </div>

    );

  }


  return (

    <>

      <Table>

        <TableHeader>

          <TableRow>

            <TableHead>
              Name
            </TableHead>

            <TableHead>
              Key
            </TableHead>

            <TableHead>
              Type
            </TableHead>

            <TableHead>
              Formula
            </TableHead>

            <TableHead>
              Unit
            </TableHead>

            <TableHead>
              Category
            </TableHead>

            <TableHead>
              Status
            </TableHead>

            <TableHead className="text-right">
              Actions
            </TableHead>

          </TableRow>

        </TableHeader>


        <TableBody>

          {metrics.map(
            (metric) => (

              <TableRow
                key={metric.id}
              >

                <TableCell className="font-medium">
                  {metric.name}
                </TableCell>

                <TableCell>
                  <code className="text-xs">
                    {metric.key}
                  </code>
                </TableCell>

                <TableCell>
                  {metric.type}
                </TableCell>

                <TableCell>
                  <code className="text-xs">
                    {metric.formula}
                  </code>
                </TableCell>

                <TableCell>
                  {metric.unit ?? "—"}
                </TableCell>

                <TableCell>
                  {metric.category ?? "—"}
                </TableCell>

                <TableCell>

                  <Badge
                    variant={
                      metric.status === "ACTIVE"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {metric.status}
                  </Badge>

                </TableCell>

                <TableCell>

                  <div className="flex justify-end gap-2">

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openEdit(metric)
                      }
                    >
                      Edit
                    </Button>

                    {metric.status === "ACTIVE" && (

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDeactivate(metric)
                        }
                      >
                        Deactivate
                      </Button>

                    )}

                  </div>

                </TableCell>

              </TableRow>

            )
          )}

        </TableBody>

      </Table>


      {message && (

        <p className="mt-4 text-sm text-muted-foreground">
          {message}
        </p>

      )}


      <Dialog
        open={!!editingMetric}
        onOpenChange={(open) => {

          if (!open) {
            setEditingMetric(null);
          }

        }}
      >

        < DialogContent className="max-w-md bg-background text-foreground shadow-xl">

          <DialogHeader>

            <DialogTitle>
              Edit Metric Definition
            </DialogTitle>

            <DialogDescription>
              Update the configuration for this metric.
            </DialogDescription>

          </DialogHeader>


          {editingMetric && (

            <form
              action={handleEdit}
              className="space-y-5"
            >

              <input
                type="hidden"
                name="modelId"
                value={editingMetric.modelId}
              />


              <div className="space-y-2">

                <Label htmlFor="edit-metric-name">
                  Name
                </Label>

                <Input
                  id="edit-metric-name"
                  name="name"
                  defaultValue={editingMetric.name}
                  required
                />

              </div>


              <div className="space-y-2">

                <Label htmlFor="edit-metric-key">
                  Key
                </Label>

                <Input
                  id="edit-metric-key"
                  name="key"
                  defaultValue={editingMetric.key}
                  required
                />

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
                    <SelectValue />
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

                <Label htmlFor="edit-metric-unit">
                  Unit
                </Label>

                <Input
                  id="edit-metric-unit"
                  name="unit"
                  defaultValue={
                    editingMetric.unit ?? ""
                  }
                />

              </div>


              <div className="space-y-2">

                <Label htmlFor="edit-metric-category">
                  Category
                </Label>

                <Input
                  id="edit-metric-category"
                  name="category"
                  defaultValue={
                    editingMetric.category ?? ""
                  }
                />

              </div>


              <div className="space-y-2">

                <Label htmlFor="edit-metric-formula">
                  Formula
                </Label>

                <Input
                  id="edit-metric-formula"
                  name="formula"
                  defaultValue={
                    editingMetric.formula
                  }
                  required
                />

              </div>


              <DialogFooter>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setEditingMetric(null)
                  }
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

              </DialogFooter>

            </form>

          )}

        </DialogContent>

      </Dialog>

    </>

  );

}
