"use client";

import { useEffect, useRef } from "react";
import { Minimize2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AnalyticsChart } from "./analytics-chart";

import type {
  AnalyticsChartRecord,
  AnalyticsModelData,
} from "../types";

type Props = {
  charts: AnalyticsChartRecord[];
  modelMap: Map<string, AnalyticsModelData>;
  onExit: () => void;
};

export function AnalyticsPresentation({
  charts,
  modelMap,
  onExit,
}: Props) {
  const presentationRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element =
      presentationRef.current;

    if (!element) {
      return;
    }

    const enterFullscreen = async () => {
      if (
        document.fullscreenEnabled &&
        !document.fullscreenElement
      ) {
        try {
          await element.requestFullscreen();
        } catch {
          // Presentation mode still works
          // if browser fullscreen is unavailable.
        }
      }
    };

    void enterFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onExit();
      }
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange,
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange,
      );
    };
  }, [onExit]);

  async function exitPresentation() {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore browser fullscreen errors.
      }
    }

    onExit();
  }

  return (
    <div
      ref={presentationRef}
      className="fixed inset-0 z-[100] flex min-h-screen flex-col overflow-auto bg-slate-950 text-white"
    >
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/95 px-5 py-3 backdrop-blur">
        <div>
          <h1 className="text-base font-semibold">
            Business Analytics
          </h1>

          <p className="text-xs text-white/50">
            Presentation mode
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          onClick={() => {
            void exitPresentation();
          }}
        >
          <Minimize2 />
          Exit presentation
        </Button>
      </header>

      <main className="flex-1 p-5 sm:p-8">
        <div className="mx-auto grid w-full max-w-[1800px] grid-cols-1 gap-6 xl:grid-cols-2">
          {charts.map((chart) => {
            const model = modelMap.get(
              chart.modelId,
            );

            if (!model) {
              return null;
            }

            return (
              <article
                key={chart.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl"
              >
                <div className="flex h-14 items-center border-b border-white/10 px-5">
                  <h2 className="truncate text-base font-semibold">
                    {chart.name}
                  </h2>
                </div>

                <div className="p-5">
                  <AnalyticsChart
                    modelData={model}
                    config={{
                      ...chart.config,
                      width: undefined,
                      height: 440,
                    }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}