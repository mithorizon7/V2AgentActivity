import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Phase = {
  id: number;
  name: string;
  completed: boolean;
  current: boolean;
};

type PhaseProgressProps = {
  phases: Phase[];
  onPhaseClick?: (phaseId: number) => void;
};

export function PhaseProgress({ phases, onPhaseClick }: PhaseProgressProps) {
  const { t } = useTranslation();
  
  return (
    <div className="sticky top-0 z-50 bg-background border-b" data-testid="phase-progress">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-2">
          {phases.map((phase, index) => {
            const isClickable = phase.completed && onPhaseClick;
            const isAccessible = phase.completed || phase.current;
            
            return (
              <div key={phase.id} className="flex items-center flex-1">
                <button
                  onClick={() => isClickable && onPhaseClick(phase.id)}
                  disabled={!isAccessible}
                  data-testid={`phase-step-${phase.id}`}
                  className={cn(
                    "flex items-center gap-3 flex-1 min-w-0 transition-all",
                    isClickable && "cursor-pointer hover-elevate active-elevate-2",
                    !isAccessible && "opacity-40 cursor-not-allowed"
                  )}
                  aria-label={t("phaseProgress.phaseLabel", { id: phase.id, name: phase.name })}
                  aria-current={phase.current ? "step" : undefined}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 flex-shrink-0 transition-all",
                      phase.completed && "bg-primary border-primary",
                      phase.current && !phase.completed && "border-primary bg-primary/10",
                      !phase.completed && !phase.current && "border-border bg-muted"
                    )}
                  >
                    {phase.completed ? (
                      <Check className="w-5 h-5 text-primary-foreground" />
                    ) : (
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          phase.current ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {phase.id}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      {t("phaseProgress.phaseNumber", { id: phase.id })}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-medium truncate w-full text-left",
                        phase.current && "text-primary font-semibold"
                      )}
                    >
                      {phase.name}
                    </span>
                  </div>
                </button>
                {index < phases.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 transition-all",
                      phase.completed ? "bg-primary" : "bg-border"
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
