import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, CheckCircle2, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type CoachState = "welcome" | "first-run" | "success-experiment" | "failure-recovery" | "completed";

type GuidedCoachPanelProps = {
  state: CoachState;
  hasRun: boolean;
  pipelineComplete: boolean;
  simulationSuccess?: boolean;
  failuresEnabled?: boolean;
  runCount?: number;
};

export function GuidedCoachPanel({
  state,
  hasRun,
  pipelineComplete,
  simulationSuccess,
  failuresEnabled = false,
  runCount = 0,
}: GuidedCoachPanelProps) {
  const { t } = useTranslation();

  const getContent = () => {
    // Welcome state: Pipeline not complete
    if (!pipelineComplete) {
      return {
        icon: Sparkles,
        iconColor: "text-purple-600",
        title: t("guidedCoach.welcome.title"),
        message: t("guidedCoach.welcome.message"),
        tip: t("guidedCoach.welcome.tip"),
      };
    }

    // First run: Pipeline complete but never run
    if (!hasRun) {
      return {
        icon: Play,
        iconColor: "text-blue-600",
        title: t("guidedCoach.firstRun.title"),
        message: t("guidedCoach.firstRun.message"),
        tip: t("guidedCoach.firstRun.tip"),
      };
    }

    // After first successful run
    if (runCount === 1 && simulationSuccess === true) {
      return {
        icon: CheckCircle2,
        iconColor: "text-green-600",
        title: t("guidedCoach.successFirst.title"),
        message: t("guidedCoach.successFirst.message"),
        tip: t("guidedCoach.successFirst.tip"),
      };
    }

    // Failed simulation
    if (simulationSuccess === false) {
      return {
        icon: Lightbulb,
        iconColor: "text-red-600",
        title: t("guidedCoach.failureRecovery.title"),
        message: t("guidedCoach.failureRecovery.message"),
        tip: t("guidedCoach.failureRecovery.tip"),
      };
    }

    // After experimenting with failures
    if (failuresEnabled) {
      return {
        icon: Lightbulb,
        iconColor: "text-amber-600",
        title: t("guidedCoach.withFailures.title"),
        message: t("guidedCoach.withFailures.message"),
        tip: t("guidedCoach.withFailures.tip"),
      };
    }

    // General experimentation after multiple successful runs
    return {
      icon: Lightbulb,
      iconColor: "text-amber-600",
      title: t("guidedCoach.changeBlock.title"),
      message: t("guidedCoach.changeBlock.message"),
      tip: t("guidedCoach.changeBlock.tip"),
    };
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <Card className="p-5 border-2 bg-gradient-to-br from-background to-muted/30">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg bg-background border", content.iconColor)}>
            <Icon className={cn("w-5 h-5", content.iconColor)} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{content.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {t("guidedCoach.badge")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content.message}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-md bg-background/50 border-l-4 border-l-primary/30">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{t("guidedCoach.tipLabel")}: </span>
            {content.tip}
          </p>
        </div>
      </div>
    </Card>
  );
}
