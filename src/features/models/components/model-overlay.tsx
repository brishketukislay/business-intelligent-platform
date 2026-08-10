"use client";

import {
ReactNode,
useEffect,
} from "react";

import {
X,
} from "lucide-react";

type ModelOverlayProps = {
open: boolean;
onClose: () => void;
title: string;
description?: string;
children: ReactNode;
maxWidth?: string;
};

export function ModelOverlay({
open,
onClose,
title,
description,
children,
maxWidth = "max-w-lg",
}: ModelOverlayProps) {

useEffect(() => {

if (!open) {
  return;
}


function handleKeyDown(
  event: KeyboardEvent
) {

  if (
    event.key === "Escape"
  ) {

    onClose();

  }

}


document.addEventListener(
  "keydown",
  handleKeyDown
);


const previousOverflow =
  document.body.style.overflow;

document.body.style.overflow =
  "hidden";


return () => {

  document.removeEventListener(
    "keydown",
    handleKeyDown
  );

  document.body.style.overflow =
    previousOverflow;

};


}, [
open,
onClose,
]);

if (!open) {
return null;
}

return (

<div
  className="
    fixed
    inset-0
    z-50
    flex
    items-center
    justify-center
    bg-black/50
    p-4
  "
  role="dialog"
  aria-modal="true"
>

  <button
    type="button"
    aria-label="Close dialog"
    onClick={onClose}
    className="absolute inset-0 cursor-default"
  />


  <div
    className={`
      relative
      z-10
      w-full
      ${maxWidth}
      rounded-xl
      border
      border-gray-200
      bg-white
      text-gray-950
      shadow-2xl
      dark:border-gray-700
      dark:bg-gray-900
      dark:text-gray-50
    `}
  >

    <div
      className="
        flex
        items-start
        justify-between
        gap-4
        border-b
        border-gray-200
        px-5
        py-4
        dark:border-gray-700
      "
    >

      <div className="min-w-0">

        <h2 className="text-lg font-semibold">
          {title}
        </h2>


        {description && (

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>

        )}

      </div>


      <button
        type="button"
        onClick={onClose}
        className="
          inline-flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-md
          text-gray-400
          transition-colors
          hover:bg-gray-100
          hover:text-gray-900
          dark:hover:bg-gray-800
          dark:hover:text-white
        "
        aria-label="Close"
      >

        <X className="h-4 w-4" />

      </button>

    </div>


    <div className="px-5 py-5">
      {children}
    </div>

  </div>

</div>


);

}