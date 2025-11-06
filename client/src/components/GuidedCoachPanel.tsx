import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, CheckCircle2, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const getContent = () => {
    if (!pipelineComplete) {
      return {
        icon: Sparkles,
        iconColor: "text-purple-600",
        title: "Your agent is ready!",
        message: "The pipeline is already set up with working blocks. Click 'Run Demo' to see how it processes wearable data.",
        tip: "The agent will: read sensor data → decide if you're active → make a plan → send a notification",
      };
    }

    if (!hasRun) {
      return {
        icon: Play,
        iconColor: "text-blue-600",
        title: "Run your first demo",
        message: "Your Health Coach agent is configured. Click 'Run Demo' to watch it process a normal active day.",
        tip: "You'll see each step: smoothing sensor noise, checking thresholds, planning a response, and sending a notification.",
      };
    }

    if (simulationSuccess === true) {
      return {
        icon: Lightbulb,
        iconColor: "text-amber-600",
        title: "Try changing something!",
        message: "Now experiment: switch 'Decide what it means' from Threshold Check to Rule Classifier and run again.",
        tip: "The Rule Classifier uses stricter criteria. Watch how this changes the final plan!",
      };
    }

    return {
      icon: CheckCircle2,
      iconColor: "text-green-600",
      title: "Great work!",
      message: "You've seen how changing blocks affects the outcome. Try toggling 'Noisy Sensor Data' to see how perception handles errors.",
      tip: "The Smooth Wearables block will average out the noise. Watch the trace to see the difference!",
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
                Guide
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content.message}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-md bg-background/50 border-l-4 border-l-primary/30">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">💡 Tip: </span>
            {content.tip}
          </p>
        </div>
      </div>
    </Card>
  );
}
