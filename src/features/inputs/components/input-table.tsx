"use client";

import { useState } from "react";

import {
  deactivateInputAction,
  updateInputAction,
} from "../actions/input-actions";

import {
  INPUT_TYPES,
  type InputType,
} from "../types";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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



type InputRecord = {
  id: string;
  modelId: string;
  name: string;
  key: string;
  type: string;
  unit: string | null;
  category: string | null;
  status: string;
};



type InputTableProps = {
  inputs: InputRecord[];
};



export function InputTable({
  inputs,
}: InputTableProps) {

  const [
    editingInput,
    setEditingInput,
  ] = useState<InputRecord | null>(
    null
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



  async function handleDeactivate(
    id: string
  ) {

    const confirmed =
      window.confirm(
        "Deactivate this input definition?"
      );


    if (!confirmed) {
      return;
    }


    setMessage(null);


    const result =
      await deactivateInputAction(
        id
      );


    if (result.success) {

      window.location.reload();

      return;

    }


    setMessage(
      "Unable to deactivate input definition."
    );

  }



  async function handleEdit(
    formData: FormData
  ) {

    if (!editingInput) {
      return;
    }


    setIsSubmitting(true);

    setMessage(null);


    try {

      const result =
        await updateInputAction(
          editingInput.id,
          formData
        );


      if (result.success) {

        setEditingInput(null);

        window.location.reload();

        return;

      }


      setMessage(
        "Unable to update input definition."
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



  if (inputs.length === 0) {

    return (
      <div className="text-sm text-muted-foreground">
        No input definitions created yet.
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

          {inputs.map(
            (input) => (

              <TableRow
                key={input.id}
              >

                <TableCell className="font-medium">
                  {input.name}
                </TableCell>


                <TableCell>

                  <code className="text-xs">
                    {input.key}
                  </code>

                </TableCell>


                <TableCell>
                  {input.type}
                </TableCell>


                <TableCell>
                  {input.unit ?? "-"}
                </TableCell>


                <TableCell>
                  {input.category ?? "-"}
                </TableCell>


                <TableCell>

                  <Badge
                    variant={
                      input.status === "ACTIVE"
                        ? "default"
                        : "secondary"
                    }
                  >

                    {input.status}

                  </Badge>

                </TableCell>


                <TableCell>

                  <div className="flex justify-end gap-2">

                    {input.status === "ACTIVE" && (

                      <>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEditingInput(
                              input
                            )
                          }
                        >
                          Edit
                        </Button>


                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDeactivate(
                              input.id
                            )
                          }
                        >
                          Deactivate
                        </Button>

                      </>

                    )}

                  </div>

                </TableCell>

              </TableRow>

            )
          )}

        </TableBody>

      </Table>



      <Dialog
        open={
          editingInput !== null
        }
        onOpenChange={(open) => {

          if (!open) {

            setEditingInput(null);

            setMessage(null);

          }

        }}
      >

        <DialogContent>

          <DialogHeader>

            <DialogTitle>
              Edit Input Definition
            </DialogTitle>

            <DialogDescription>
              Update the configuration for
              this input definition.
            </DialogDescription>

          </DialogHeader>



          {editingInput && (

            <form
              action={handleEdit}
              className="space-y-5"
            >

              <input
                type="hidden"
                name="modelId"
                value={
                  editingInput.modelId
                }
              />



              <div className="space-y-2">

                <Label htmlFor="edit-name">
                  Name
                </Label>

                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={
                    editingInput.name
                  }
                  required
                />

              </div>



              <div className="space-y-2">

                <Label htmlFor="edit-key">
                  Key
                </Label>

                <Input
                  id="edit-key"
                  name="key"
                  defaultValue={
                    editingInput.key
                  }
                  required
                />

              </div>



              <div className="space-y-2">

                <Label>
                  Type
                </Label>


                <Select
                  defaultValue={
                    editingInput.type
                  }
                  onValueChange={() => {}}
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
                  value={
                    editingInput.type
                  }
                />

              </div>



              <div className="space-y-2">

                <Label htmlFor="edit-unit">
                  Unit
                </Label>

                <Input
                  id="edit-unit"
                  name="unit"
                  defaultValue={
                    editingInput.unit ?? ""
                  }
                />

              </div>



              <div className="space-y-2">

                <Label htmlFor="edit-category">
                  Category
                </Label>

                <Input
                  id="edit-category"
                  name="category"
                  defaultValue={
                    editingInput.category ?? ""
                  }
                />

              </div>



              {message && (

                <p className="text-sm text-destructive">
                  {message}
                </p>

              )}



              <DialogFooter>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setEditingInput(null)
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
