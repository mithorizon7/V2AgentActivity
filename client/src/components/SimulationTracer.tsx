import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SimulationStep } from "@shared/schema";
import { Play, Pause, SkipForward, RotateCcw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type SimulationTracerProps = {
  steps: SimulationStep[];
  onRun: () => void;
  onReset: () => void;
  isRunning: boolean;
};

export function SimulationTracer({
  steps,
  onRun,
  onReset,
  isRunning,
}: SimulationTracerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handlePlay = () => {
    if (currentStepIndex >= steps.length) {
      setCurrentStepIndex(0);
    }
    setIsPaused(false);
    onRun();
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPaused(false);
    onReset();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Simulation Execution</h3>
            <div className="flex gap-2">
              {isPaused || !isRunning ? (
                <Button onClick={handlePlay} data-testid="button-play">
                  <Play className="w-4 h-4 mr-2" />
                  Run
                </Button>
              ) : (
                <Button onClick={handlePause} variant="secondary" data-testid="button-pause">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentStepIndex >= steps.length - 1}
                data-testid="button-next-step"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={handleReset} data-testid="button-reset">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {steps.length === 0 ? (
              <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                <p className="text-muted-foreground">Build a circuit to run a simulation</p>
              </div>
            ) : (
              steps.map((step, index) => {
                const isCurrent = index === currentStepIndex;
                const isPast = index < currentStepIndex;

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "p-4 border-2 rounded-md transition-all",
                      isCurrent && "border-primary bg-primary/5 ring-2 ring-primary/20",
                      isPast && "opacity-60",
                      !isCurrent && !isPast && "opacity-40"
                    )}
                    data-testid={`simulation-step-${index}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            Step {index + 1}
                          </Badge>
                          <span className="font-medium text-sm">{step.blockId}</span>
                          {step.status === "success" && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          )}
                          {step.status === "error" && (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          {step.status === "pending" && (
                            <Clock className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        {step.message && (
                          <p className="text-sm text-muted-foreground">{step.message}</p>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-muted/50 rounded">
                            <div className="font-semibold mb-1">Input:</div>
                            <div className="font-mono">{JSON.stringify(step.input)}</div>
                          </div>
                          <div className="p-2 bg-muted/50 rounded">
                            <div className="font-semibold mb-1">Output:</div>
                            <div className="font-mono">{JSON.stringify(step.output)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-lg">Execution Log</h3>
        <ScrollArea className="h-96">
          <div className="space-y-2 font-mono text-xs">
            {steps.length === 0 ? (
              <p className="text-muted-foreground">No logs yet</p>
            ) : (
              steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "p-2 rounded border-l-2",
                    step.status === "success" && "border-green-600 bg-green-50 dark:bg-green-950",
                    step.status === "error" && "border-red-600 bg-red-50 dark:bg-red-950",
                    step.status === "pending" && "border-amber-600 bg-amber-50 dark:bg-amber-950"
                  )}
                  data-testid={`log-entry-${index}`}
                >
                  <div className="text-muted-foreground">
                    [{new Date(step.timestamp).toLocaleTimeString()}]
                  </div>
                  <div className="font-semibold">{step.blockId}</div>
                  {step.message && <div className="mt-1">{step.message}</div>}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
