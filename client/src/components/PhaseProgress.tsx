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
    <div className="sticky top-0 z-50 bg-background border-b shadow-sm" data-testid="phase-progress">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
          {phases.map((phase, index) => {
            const isClickable = onPhaseClick;
            
            return (
              <div key={phase.id} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => isClickable && onPhaseClick(phase.id)}
                  data-testid={`phase-step-${phase.id}`}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 transition-all min-h-[44px] min-w-[44px] sm:min-h-[auto] sm:min-w-0",
                    isClickable && "cursor-pointer hover-elevate active-elevate-2"
                  )}
                  aria-label={t("phaseProgress.phaseLabel", { id: phase.id, name: phase.name })}
                  aria-current={phase.current ? "step" : undefined}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex-shrink-0 transition-all",
                      phase.completed && "bg-primary border-primary",
                      phase.current && !phase.completed && "border-primary bg-primary/10",
                      !phase.completed && !phase.current && "border-border bg-muted"
                    )}
                  >
                    {phase.completed ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                    ) : (
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-semibold",
                          phase.current ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {phase.id}
                      </span>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col items-start min-w-0">
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
                      "h-0.5 w-4 sm:w-8 mx-1 sm:mx-2 transition-all flex-shrink-0",
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
