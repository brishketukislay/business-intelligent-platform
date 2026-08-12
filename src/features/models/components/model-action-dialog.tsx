"use client";

import {
  ReactNode,
  cloneElement,
  isValidElement,
} from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ModelActionDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

export function ModelActionDialog({
  open = false,
  onOpenChange,
  trigger,
  title,
  description,
  children,
}: ModelActionDialogProps) {
  function handleTriggerClick() {
    onOpenChange?.(true);
  }

  const triggerElement = isValidElement(trigger)
    ? cloneElement(
        trigger as React.ReactElement<{
          onClick?: (
            event: React.MouseEvent
          ) => void;
        }>,
        {
          onClick: handleTriggerClick,
        },
      )
    : trigger;

  return (
    <>
      {triggerElement}

      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent
          className="
            w-[calc(100%-2rem)]
            max-w-lg
            !border-slate-200
            !bg-white
            !text-slate-950
            p-0
            shadow-2xl
            sm:rounded-xl
            [&>button]:text-slate-500
            [&>button]:hover:text-slate-950
          "
        >
          <DialogHeader
            className="
              border-b
              border-slate-200
              bg-white
              px-6
              py-5
            "
          >
            <DialogTitle
              className="
                text-lg
                font-semibold
                text-slate-950
              "
            >
              {title}
            </DialogTitle>

            <DialogDescription
              className="
                mt-1
                text-sm
                leading-5
                text-slate-600
              "
            >
              {description}
            </DialogDescription>
          </DialogHeader>

          <div
            className="
              max-h-[75vh]
              overflow-y-auto
              bg-white
              px-6
              py-6
            "
          >
            {children}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}