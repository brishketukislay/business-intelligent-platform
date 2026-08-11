"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Button,
} from "@/components/ui/button";

import {
  duplicateScenarioAction,
} from "../actions/scenario-actions";


type ScenarioCopyButtonProps = {
  modelId: string;
  scenarioId: string;
};


export function ScenarioCopyButton({
  modelId,
  scenarioId,
}: ScenarioCopyButtonProps) {
  const router =
    useRouter();

  const [
    copying,
    setCopying,
  ] = useState(false);

  async function handleCopy(
    event: React.MouseEvent
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (copying) {
      return;
    }

    setCopying(true);

    try {
      const result =
        await duplicateScenarioAction(
          modelId,
          scenarioId
        );

      if (!result.success) {
        window.alert(
          result.error ??
            "Unable to copy scenario."
        );

        return;
      }

      router.push(
        `/models/${modelId}/scenarios/${result.scenarioId}`
      );
    } catch (error) {
      console.error(
        "Failed to copy scenario:",
        error
      );

      window.alert(
        "Unable to copy scenario."
      );
    } finally {
      setCopying(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      disabled={copying}
    >
      {copying
        ? "Copying..."
        : "Copy"}
    </Button>
  );
}