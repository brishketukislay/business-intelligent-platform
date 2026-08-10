"use client";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

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
  ModelActionDialog,
} from "./model-action-dialog";

import {
  shareModelAction,
  updateModelShareAction,
  removeModelShareAction,
} from "../actions/model-sharing-actions";


type ModelShare = {
  id: string;

  permission: "VIEW" | "EDIT";

  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    status: string;
  };
};


type ModelSharingDialogProps = {
  modelId: string;
  currentUserId: string;
  shares: ModelShare[];
};


export function ModelSharingDialog({
  modelId,
  currentUserId,
  shares,
}: ModelSharingDialogProps) {

  const router =
    useRouter();


  const [
    open,
    setOpen,
  ] = useState(false);


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    permission,
    setPermission,
  ] = useState<"VIEW" | "EDIT">(
    "VIEW"
  );


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


  async function handleShare() {

    const cleanEmail =
      email.trim();


    if (!cleanEmail) {

      setError(
        "Enter an email address."
      );

      return;

    }


    setIsSubmitting(true);
    setError(null);


    try {

      const result =
        await shareModelAction(
          modelId,
          currentUserId,
          cleanEmail,
          permission
        );


      if (!result.success) {

        setError(
          result.error ??
          "Unable to share this model."
        );

        return;

      }


      setEmail("");


      router.refresh();

    } catch (error) {

      console.error(error);

      setError(
        "Unable to share this model."
      );

    } finally {

      setIsSubmitting(false);

    }

  }


  async function handlePermissionChange(
    targetUserId: string,
    nextPermission: "VIEW" | "EDIT"
  ) {

    setError(null);


    try {

      const result =
        await updateModelShareAction(
          modelId,
          currentUserId,
          targetUserId,
          nextPermission
        );


      if (!result.success) {

        setError(
          result.error ??
          "Unable to update permission."
        );

        return;

      }


      router.refresh();

    } catch (error) {

      console.error(error);

      setError(
        "Unable to update permission."
      );

    }

  }


  async function handleRemove(
    targetUserId: string
  ) {

    setError(null);


    try {

      const result =
        await removeModelShareAction(
          modelId,
          currentUserId,
          targetUserId
        );


      if (!result.success) {

        setError(
          result.error ??
          "Unable to remove access."
        );

        return;

      }


      router.refresh();

    } catch (error) {

      console.error(error);

      setError(
        "Unable to remove access."
      );

    }

  }


  return (

    <ModelActionDialog
      open={open}
      onOpenChange={setOpen}

      trigger={

        <Button
          type="button"
          variant="outline"
          className="
            border-slate-300
            bg-white
            text-slate-900
            hover:bg-slate-50
          "
        >
          Share Model
        </Button>

      }

      title="Share Model"

      description="
        Give other users access to this business model.
      "
    >

      <div className="space-y-6">

        <div className="space-y-4">

          <div className="space-y-2">

            <Label
              htmlFor="share-model-email"
              className="text-sm font-medium text-slate-900"
            >
              Email address
            </Label>


            <Input
              id="share-model-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="name@example.com"
              className="
                h-11
                w-full
                border-slate-300
                bg-white
                text-slate-950
                placeholder:text-slate-400
                focus-visible:ring-slate-400
              "
            />

          </div>


          <div className="space-y-2">

            <Label
              htmlFor="share-model-permission"
              className="text-sm font-medium text-slate-900"
            >
              Permission
            </Label>


            <select
              id="share-model-permission"
              value={permission}
              onChange={(event) =>
                setPermission(
                  event.target.value as
                    "VIEW" | "EDIT"
                )
              }
              className="
                h-11
                w-full
                rounded-md
                border
                border-slate-300
                bg-white
                px-3
                text-sm
                text-slate-950
                outline-none
                focus:border-slate-400
                focus:ring-2
                focus:ring-slate-200
              "
            >

              <option value="VIEW">
                View only
              </option>

              <option value="EDIT">
                Can edit
              </option>

            </select>

          </div>


          {error && (

            <div
              className="
                rounded-md
                border
                border-red-200
                bg-red-50
                px-3
                py-2.5
              "
            >

              <p
                className="
                  text-sm
                  text-red-700
                "
              >
                {error}
              </p>

            </div>

          )}


          <div className="flex justify-end">

            <Button
              type="button"
              onClick={handleShare}
              disabled={
                isSubmitting ||
                !email.trim()
              }
              className="
                bg-slate-900
                text-white
                hover:bg-slate-800
              "
            >
              {isSubmitting
                ? "Sharing..."
                : "Share Model"}
            </Button>

          </div>

        </div>


        <div
          className="
            border-t
            border-slate-200
            pt-5
          "
        >

          <div className="mb-3">

            <h3
              className="
                text-sm
                font-semibold
                text-slate-950
              "
            >
              People with access
            </h3>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Manage users who can access this model.
            </p>

          </div>


          {shares.length === 0 ? (

            <div
              className="
                rounded-md
                border
                border-dashed
                border-slate-300
                bg-slate-50
                px-4
                py-5
                text-center
              "
            >

              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                This model has not been shared with anyone yet.
              </p>

            </div>

          ) : (

            <div className="space-y-2">

              {shares.map(
                (share) => (

                  <div
                    key={share.id}
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-3
                    "
                  >

                    <div className="min-w-0">

                      <p
                        className="
                          truncate
                          text-sm
                          font-medium
                          text-slate-900
                        "
                      >
                        {share.user.name ??
                          share.user.email}
                      </p>

                      <p
                        className="
                          truncate
                          text-xs
                          text-slate-500
                        "
                      >
                        {share.user.email}
                      </p>

                    </div>


                    <div
                      className="
                        flex
                        shrink-0
                        items-center
                        gap-2
                      "
                    >

                      <select
                        value={share.permission}
                        onChange={(event) =>
                          handlePermissionChange(
                            share.user.id,
                            event.target.value as
                              "VIEW" | "EDIT"
                          )
                        }
                        className="
                          h-9
                          rounded-md
                          border
                          border-slate-300
                          bg-white
                          px-2
                          text-xs
                          text-slate-900
                        "
                      >

                        <option value="VIEW">
                          View
                        </option>

                        <option value="EDIT">
                          Edit
                        </option>

                      </select>


                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemove(
                            share.user.id
                          )
                        }
                        className="
                          text-red-600
                          hover:bg-red-50
                          hover:text-red-700
                        "
                      >
                        Remove
                      </Button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </ModelActionDialog>

  );

}
