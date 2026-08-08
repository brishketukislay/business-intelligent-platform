"use client";

import { useState } from "react";

import {
  createBusinessModelAction,
} from "../actions/model-actions";

import {
  MODEL_STATUSES,
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


export function ModelForm() {

  const [
    open,
    setOpen,
  ] = useState(false);


  const [
    status,
    setStatus,
  ] = useState("ACTIVE");


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
        await createBusinessModelAction(
          formData
        );


      if (!result.success) {

        setError(
          typeof result.error === "string"
            ? result.error
            : "Unable to create model."
        );

        return;

      }


      setOpen(false);

      window.location.reload();

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

    <Dialog
      open={open}
      onOpenChange={setOpen}
    >

      <DialogTrigger
        className="
          inline-flex
          h-10
          items-center
          justify-center
          rounded-md
          bg-primary
          px-4
          py-2
          text-sm
          font-medium
          text-primary-foreground
          transition-colors
          hover:bg-primary/90
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
          disabled:pointer-events-none
          disabled:opacity-50
        "
      >
        Create Model
      </DialogTrigger>


      <DialogContent>

        <DialogHeader>

          <DialogTitle>
            Create Business Model
          </DialogTitle>

          <DialogDescription>
            Create a configurable business model.
          </DialogDescription>

        </DialogHeader>


        <form
          action={handleSubmit}
          className="space-y-5"
        >

          <div className="space-y-2">

            <Label htmlFor="model-name">
              Name
            </Label>

            <Input
              id="model-name"
              name="name"
              placeholder="e.g. Standard Business Model"
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
              placeholder="Describe the purpose of this model."
              rows={4}
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
                  setStatus(value);
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

            <p className="text-sm text-destructive">
              {error}
            </p>

          )}


          <DialogFooter>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setOpen(false)
              }
            >
              Cancel
            </Button>


            <Button
              type="submit"
              disabled={isSubmitting}
            >

              {isSubmitting
                ? "Creating..."
                : "Create Model"}

            </Button>

          </DialogFooter>

        </form>

      </DialogContent>

    </Dialog>

  );

}
