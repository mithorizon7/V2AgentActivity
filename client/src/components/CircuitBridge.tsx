import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  ArrowDown, 
  Map, 
  Workflow, 
  Eye, 
  Brain, 
  ListChecks, 
  Zap,
  CheckCircle2,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

type CircuitBridgeProps = {
  onComplete: () => void;
  onBack: () => void;
  isAlreadyComplete?: boolean;
  boundaryElements?: Array<{ type: string; label: string }>;
};

const PROCESS_ICONS = {
  perception: Eye,
  reasoning: Brain,
  planning: ListChecks,
  execution: Zap,
};

const PROCESS_COLORS = {
  perception: "bg-green-100 dark:bg-green-950/30 border-green-500/30 text-green-700 dark:text-green-300",
  reasoning: "bg-blue-100 dark:bg-blue-950/30 border-blue-500/30 text-blue-700 dark:text-blue-300",
  planning: "bg-purple-100 dark:bg-purple-950/30 border-purple-500/30 text-purple-700 dark:text-purple-300",
  execution: "bg-orange-100 dark:bg-orange-950/30 border-orange-500/30 text-orange-700 dark:text-orange-300",
};

export function CircuitBridge({ onComplete, onBack, isAlreadyComplete }: CircuitBridgeProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<"intro" | "connection" | "ready">(
    isAlreadyComplete ? "ready" : "intro"
  );

  const renderIntro = () => (
    <div className="space-y-8">
      <div className="flex justify-center gap-2" role="progressbar" aria-valuenow={1} aria-valuemin={1} aria-valuemax={3}>
        {[1, 2, 3].map((step) => (
          <div 
            key={step}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              step === 1 ? "w-12 bg-primary" : "w-8 bg-border"
            )}
          />
        ))}
      </div>

      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t("bridge.title")}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t("bridge.subtitle")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="p-6 space-y-4 border-2 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Map className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{t("bridge.whatYouDid")}</h3>
              <p className="text-sm text-muted-foreground">{t("bridge.boundaryMapPhase")}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">{t("bridge.boundaryMapSummary")}</p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{t("bridge.identified.inputs")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{t("bridge.identified.outputs")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{t("bridge.identified.environment")}</span>
              </li>
            </ul>
          </div>
        </Card>

        <Card className="p-6 space-y-4 border-2 border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Workflow className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold">{t("bridge.whatComesNext")}</h3>
              <p className="text-sm text-muted-foreground">{t("bridge.circuitPhase")}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">{t("bridge.circuitPreview")}</p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>{t("bridge.willDo.perception")}</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>{t("bridge.willDo.reasoning")}</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>{t("bridge.willDo.planning")}</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>{t("bridge.willDo.execution")}</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={() => setCurrentStep("connection")} data-testid="button-bridge-continue">
          {t("bridge.seeConnection")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderConnection = () => (
    <div className="space-y-8">
      <div className="flex justify-center gap-2" role="progressbar" aria-valuenow={2} aria-valuemin={1} aria-valuemax={3}>
        {[1, 2, 3].map((step) => (
          <div 
            key={step}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              step <= 2 ? "w-12 bg-primary" : "w-8 bg-border"
            )}
          />
        ))}
      </div>

      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t("bridge.connectionTitle")}
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t("bridge.connectionSubtitle")}
        </p>
      </div>

      <Card className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="gap-1">
              <Map className="w-3 h-3" />
              {t("bridge.boundaryElement")}
            </Badge>
            <ArrowRight className="w-4 h-4" />
            <Badge variant="outline" className="gap-1">
              <Workflow className="w-3 h-3" />
              {t("bridge.pipelineStep")}
            </Badge>
          </div>

          <div className="space-y-4">
            {(["perception", "reasoning", "planning", "execution"] as const).map((process) => {
              const Icon = PROCESS_ICONS[process];
              return (
                <div 
                  key={process}
                  className={cn(
                    "flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border-2",
                    PROCESS_COLORS[process]
                  )}
                >
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold capitalize">{t(`bridge.steps.${process}.name`)}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 hidden sm:block flex-shrink-0" />
                  <ArrowDown className="w-4 h-4 sm:hidden flex-shrink-0 mx-auto" />
                  <div className="flex-1 text-sm">
                    <p>{t(`bridge.steps.${process}.connection`)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary">{t("bridge.keyInsight")}</p>
                <p className="text-muted-foreground mt-1">{t("bridge.keyInsightText")}</p>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => setCurrentStep("intro")} data-testid="button-bridge-back">
          {t("common.back")}
        </Button>
        <Button onClick={() => setCurrentStep("ready")} data-testid="button-bridge-ready">
          {t("bridge.imReady")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderReady = () => (
    <div className="space-y-8">
      <div className="flex justify-center gap-2" role="progressbar" aria-valuenow={3} aria-valuemin={1} aria-valuemax={3}>
        {[1, 2, 3].map((step) => (
          <div 
            key={step}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              "w-12 bg-primary"
            )}
          />
        ))}
      </div>

      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t("bridge.readyTitle")}
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t("bridge.readySubtitle")}
        </p>
      </div>

      <Card className="p-6 max-w-2xl mx-auto border-2 border-green-500/20 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
        <div className="space-y-4">
          <h3 className="font-semibold text-center">{t("bridge.nextSteps")}</h3>
          <p className="text-sm text-muted-foreground text-center">
            {t("bridge.nextStepsDescription")}
          </p>
        </div>
      </Card>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => setCurrentStep("connection")} data-testid="button-bridge-review">
          {t("bridge.reviewConnection")}
        </Button>
        <Button onClick={onComplete} data-testid="button-bridge-start-circuit">
          {t("bridge.startCircuit")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {currentStep === "intro" && renderIntro()}
      {currentStep === "connection" && renderConnection()}
      {currentStep === "ready" && renderReady()}
      
      {currentStep === "intro" && (
        <div className="flex justify-start">
          <Button variant="ghost" onClick={onBack} data-testid="button-bridge-back-to-phase2">
            {t("navigation.previousPhase")}
          </Button>
        </div>
      )}
    </div>
  );
}
