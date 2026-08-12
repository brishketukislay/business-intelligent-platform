"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      {...props}
    />
  );
}

function DialogTrigger({
  ...props
}: DialogPrimitive.Trigger.Props) {
  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      {...props}
    />
  );
}

function DialogPortal({
  ...props
}: DialogPrimitive.Portal.Props) {
  return (
    <DialogPrimitive.Portal
      data-slot="dialog-portal"
      {...props}
    />
  );
}

function DialogClose({
  ...props
}: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      {...props}
    />
  );
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-[9998]",
        "bg-black/55",
        "supports-[backdrop-filter]:backdrop-blur-[2px]",
        "duration-200",
        "data-open:animate-in",
        "data-open:fade-in-0",
        "data-closed:animate-out",
        "data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogPrimitive.Backdrop
        data-slot="dialog-overlay"
        className={cn(
          "fixed inset-0 z-[9998]",
          "bg-black/55",
          "supports-[backdrop-filter]:backdrop-blur-[2px]",
          "duration-200",
          "data-open:animate-in",
          "data-open:fade-in-0",
          "data-closed:animate-out",
          "data-closed:fade-out-0",
        )}
      />

      <DialogPrimitive.Viewport
        data-slot="dialog-viewport"
        className={cn(
          "fixed inset-0 z-[9999]",
          "flex items-center justify-center",
          "overflow-y-auto",
          "bg-transparent",
          "p-4 sm:p-6",
        )}
      >
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(
            "relative",
            "w-full max-w-lg",
            "overflow-hidden",
            "rounded-2xl",

            // The modal surface must always be opaque.
            "!border-slate-200",
            "!bg-white",
            "!text-slate-950",

            "shadow-2xl",
            "ring-1 ring-black/10",
            "outline-none",

            "duration-200",
            "data-open:animate-in",
            "data-open:fade-in-0",
            "data-open:zoom-in-95",
            "data-closed:animate-out",
            "data-closed:fade-out-0",
            "data-closed:zoom-out-95",

            className,
          )}
          {...props}
        >
          {children}

          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              aria-label="Close dialog"
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    "absolute right-4 top-4 z-30",
                    "size-9 rounded-lg",
                    "border border-slate-200",
                    "bg-white",
                    "text-slate-500",
                    "shadow-sm",
                    "hover:bg-slate-100",
                    "hover:text-slate-900",
                  )}
                />
              }
            >
              <XIcon className="size-4" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-1.5 p-6",
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2",
        "border-t border-slate-200",
        "bg-white",
        "p-4 sm:p-5",
        "sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}

      {showCloseButton && (
        <DialogPrimitive.Close
          data-slot="dialog-close"
          render={
            <Button variant="outline">
              Close
            </Button>
          }
        >
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({
  className,
  ...props
}: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-base font-semibold leading-none text-slate-950",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-slate-500",
        "[&_a]:underline",
        "[&_a]:underline-offset-3",
        "[&_a:hover]:text-slate-950",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};