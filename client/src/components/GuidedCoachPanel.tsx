import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, CheckCircle2, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type CoachState = "welcome" | "first-run" | "change-block" | "try-failure" | "completed";

type GuidedCoachPanelProps = {
  state: CoachState;
  hasRun: boolean;
  pipelineComplete: boolean;
  simulationSuccess?: boolean;
};

export function GuidedCoachPanel({
  state,
  hasRun,
  pipelineComplete,
  simulationSuccess,
}: GuidedCoachPanelProps) {
  const { t } = useTranslation();

  const getContent = () => {
    if (!pipelineComplete) {
      return {
        icon: Sparkles,
        iconColor: "text-purple-600",
        title: t("guidedCoach.welcome.title"),
        message: t("guidedCoach.welcome.message"),
        tip: t("guidedCoach.welcome.tip"),
      };
    }

    if (!hasRun) {
      return {
        icon: Play,
        iconColor: "text-blue-600",
        title: t("guidedCoach.firstRun.title"),
        message: t("guidedCoach.firstRun.message"),
        tip: t("guidedCoach.firstRun.tip"),
      };
    }

    if (simulationSuccess === true) {
      return {
        icon: Lightbulb,
        iconColor: "text-amber-600",
        title: t("guidedCoach.changeBlock.title"),
        message: t("guidedCoach.changeBlock.message"),
        tip: t("guidedCoach.changeBlock.tip"),
      };
    }

    return {
      icon: CheckCircle2,
      iconColor: "text-green-600",
      title: t("guidedCoach.tryFailure.title"),
      message: t("guidedCoach.tryFailure.message"),
      tip: t("guidedCoach.tryFailure.tip"),
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
