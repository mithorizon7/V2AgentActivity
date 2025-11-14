import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Lightbulb, AlertTriangle, CheckCircle2, X, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { AgentProcess } from "@shared/schema";

type WorkedExampleProps = {
  onComplete: () => void;
};

type ExampleCard = {
  id: string;
  text: string;
  correctProcess: AgentProcess;
  explanation: string;
  pipelineStep?: number;
  commonMistake?: AgentProcess;
  commonMistakeReason?: string;
};

const PROCESS_COLORS: Record<AgentProcess, string> = {
  perception: "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300",
  reasoning: "bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-300",
  planning: "bg-pink-500/10 border-pink-500/20 text-pink-700 dark:text-pink-300",
  execution: "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300",
  learning: "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300",
  interaction: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300",
};

const PIPELINE_PROCESSES: AgentProcess[] = ["perception", "reasoning", "planning", "execution"];
const SUPPORTING_PROCESSES: AgentProcess[] = ["learning", "interaction"];

export function WorkedExample({ onComplete }: WorkedExampleProps) {
  const { t } = useTranslation();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userGuess, setUserGuess] = useState<AgentProcess | null>(null);
  const [showSynthesis, setShowSynthesis] = useState(false);
  const [synthesisText, setSynthesisText] = useState("");

  const exampleCards: ExampleCard[] = [
    {
      id: "parse-sensor",
      text: t("workedExample.cards.parseSensor.text"),
      correctProcess: "perception",
      explanation: t("workedExample.cards.parseSensor.explanation"),
      pipelineStep: 1,
      commonMistake: "reasoning",
      commonMistakeReason: t("workedExample.cards.parseSensor.commonMistakeReason"),
    },
    {
      id: "threshold-check",
      text: t("workedExample.cards.thresholdCheck.text"),
      correctProcess: "reasoning",
      explanation: t("workedExample.cards.thresholdCheck.explanation"),
      pipelineStep: 2,
      commonMistake: "perception",
      commonMistakeReason: t("workedExample.cards.thresholdCheck.commonMistakeReason"),
    },
    {
      id: "choose-action",
      text: t("workedExample.cards.chooseAction.text"),
      correctProcess: "planning",
      explanation: t("workedExample.cards.chooseAction.explanation"),
      pipelineStep: 3,
      commonMistake: "reasoning",
      commonMistakeReason: t("workedExample.cards.chooseAction.commonMistakeReason"),
    },
    {
      id: "send-message",
      text: t("workedExample.cards.sendMessage.text"),
      correctProcess: "execution",
      explanation: t("workedExample.cards.sendMessage.explanation"),
      pipelineStep: 4,
      commonMistake: "planning",
      commonMistakeReason: t("workedExample.cards.sendMessage.commonMistakeReason"),
    },
    {
      id: "store-baseline",
      text: t("workedExample.cards.storeBaseline.text"),
      correctProcess: "learning",
      explanation: t("workedExample.cards.storeBaseline.explanation"),
      commonMistake: "perception",
      commonMistakeReason: t("workedExample.cards.storeBaseline.commonMistakeReason"),
    },
    {
      id: "call-api",
      text: t("workedExample.cards.callApi.text"),
      correctProcess: "interaction",
      explanation: t("workedExample.cards.callApi.explanation"),
      commonMistake: "execution",
      commonMistakeReason: t("workedExample.cards.callApi.commonMistakeReason"),
    },
    {
      id: "calendar-schedule",
      text: t("workedExample.cards.calendarSchedule.text"),
      correctProcess: "interaction",
      explanation: t("workedExample.cards.calendarSchedule.explanation"),
      commonMistake: "planning",
      commonMistakeReason: t("workedExample.cards.calendarSchedule.commonMistakeReason"),
    },
  ];

  const currentCard = exampleCards[currentCardIndex];
  const isLastCard = currentCardIndex === exampleCards.length - 1;
  const hasGuessed = userGuess !== null;
  const isCorrectGuess = hasGuessed && userGuess === currentCard.correctProcess;
  const isCommonMistake = hasGuessed && userGuess === currentCard.commonMistake;

  const handleNext = () => {
    if (isLastCard && !showSynthesis) {
      setShowSynthesis(true);
    } else if (showSynthesis) {
      onComplete();
    } else {
      setCurrentCardIndex((prev) => prev + 1);
      setUserGuess(null); // Reset guess for next card
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setUserGuess(null); // Reset guess
    }
  };

  const handleProcessGuess = (process: AgentProcess) => {
    setUserGuess(process);
  };

  const getProcessLabel = (process: AgentProcess) => {
    return t(`workedExample.processLabels.${process}`);
  };

  if (showSynthesis) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
              <Lightbulb className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">{t("workedExample.synthesis.title")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("workedExample.synthesis.subtitle")}
            </p>
          </div>

          <Card className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{t("workedExample.synthesis.prompt")}</h3>
              
              <div className="space-y-2">
                <Textarea
                  value={synthesisText}
                  onChange={(e) => setSynthesisText(e.target.value)}
                  placeholder={t("workedExample.synthesis.placeholder")}
                  className="min-h-[150px] resize-none"
                  data-testid="input-synthesis"
                  aria-label={t("workedExample.synthesis.prompt")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("workedExample.synthesis.characterCount", { count: synthesisText.length })}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-lg bg-muted/50 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                {t("workedExample.synthesis.expertSummaryTitle")}
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>{t("workedExample.synthesis.perceptionRule")}</strong></p>
                <p><strong>{t("workedExample.synthesis.reasoningRule")}</strong></p>
                <p><strong>{t("workedExample.synthesis.planningRule")}</strong></p>
                <p><strong>{t("workedExample.synthesis.executionRule")}</strong></p>
                <p className="text-muted-foreground italic pt-2">{t("workedExample.synthesis.supportingNote")}</p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={handleNext} size="lg" data-testid="button-complete-synthesis">
                {t("workedExample.synthesis.continue")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold">{t("workedExample.title")}</h1>
            <p className="text-lg sm:text-xl text-muted-foreground">{t("workedExample.subtitle")}</p>
          </div>

          {/* Pipeline Visualization */}
          <Card className="p-4 sm:p-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-center">{t("workedExample.pipeline.title")}</h3>
              
              {/* Desktop: Horizontal stepper */}
              <div className="hidden sm:flex items-center justify-center gap-2">
                {PIPELINE_PROCESSES.map((process, index) => (
                  <div key={process} className="flex items-center">
                    <div
                      className={cn(
                        "px-4 py-2 rounded-md border-2 transition-all",
                        PROCESS_COLORS[process],
                        currentCard.pipelineStep === index + 1 && "ring-2 ring-primary ring-offset-2"
                      )}
                      aria-current={currentCard.pipelineStep === index + 1 ? "step" : undefined}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{index + 1}</span>
                        <span className="text-sm font-medium">{getProcessLabel(process)}</span>
                      </div>
                    </div>
                    {index < PIPELINE_PROCESSES.length - 1 && (
                      <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile: Stacked */}
              <div className="flex sm:hidden flex-col gap-2">
                {PIPELINE_PROCESSES.map((process, index) => (
                  <div
                    key={process}
                    className={cn(
                      "px-4 py-2 rounded-md border-2 transition-all",
                      PROCESS_COLORS[process],
                      currentCard.pipelineStep === index + 1 && "ring-2 ring-primary ring-offset-2"
                    )}
                    aria-current={currentCard.pipelineStep === index + 1 ? "step" : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{index + 1}</span>
                      <span className="text-sm font-medium">{getProcessLabel(process)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Supporting Systems */}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground text-center mb-2">
                  {t("workedExample.pipeline.supportingLabel")}
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {SUPPORTING_PROCESSES.map((process) => (
                    <Badge key={process} variant="outline" className={cn("text-xs", PROCESS_COLORS[process])}>
                      {getProcessLabel(process)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Progress */}
          <div className="flex items-center justify-center">
            <Badge variant="outline">
              {t("workedExample.progress", { current: currentCardIndex + 1, total: exampleCards.length })}
            </Badge>
          </div>
        </div>

        <Card className="p-6 sm:p-8 space-y-6">
          {/* Instruction */}
          <p className="text-sm text-muted-foreground text-center">
            {t("workedExample.instruction")}
          </p>

          {/* Card being classified */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">{t("workedExample.cardLabel")}</span>
            </div>
            <Card className="p-6 border-2">
              <p className="text-lg font-medium">{currentCard.text}</p>
            </Card>
          </div>

          {/* Prediction buttons */}
          {!hasGuessed ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold">{t("workedExample.yourGuess")}</p>
              <div role="radiogroup" aria-label={t("workedExample.selectProcess")} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...PIPELINE_PROCESSES, ...SUPPORTING_PROCESSES].map((process) => (
                  <button
                    key={process}
                    onClick={() => handleProcessGuess(process)}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      "hover-elevate active-elevate-2",
                      PROCESS_COLORS[process]
                    )}
                    role="radio"
                    aria-checked={false}
                    data-testid={`button-guess-${process}`}
                  >
                    <span className="font-semibold text-sm">{getProcessLabel(process)}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4" role="status" aria-live="polite">
              {/* Feedback */}
              <div className={cn(
                "p-4 rounded-lg border-2 animate-in fade-in slide-in-from-top-2 duration-300",
                isCorrectGuess 
                  ? "bg-green-50 dark:bg-green-950/20 border-green-500" 
                  : "bg-red-50 dark:bg-red-950/20 border-red-500"
              )}>
                <div className="flex items-start gap-3">
                  {isCorrectGuess ? (
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">
                      {isCorrectGuess ? t("workedExample.correct") : t("workedExample.incorrect")}
                    </p>
                    <p className="text-sm">
                      {isCorrectGuess 
                        ? t("workedExample.correctFeedback", { process: getProcessLabel(currentCard.correctProcess) })
                        : t("workedExample.incorrectFeedback", { 
                            guess: getProcessLabel(userGuess!), 
                            correct: getProcessLabel(currentCard.correctProcess) 
                          })
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Common Mistake Warning (if applicable) */}
              {isCommonMistake && currentCard.commonMistakeReason && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                        {t("workedExample.commonMistakeTitle")}
                      </p>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        {currentCard.commonMistakeReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expert's Answer */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold">{t("workedExample.expertAnswer")}</span>
                </div>
                <Card className={cn("p-4 border-2 animate-in fade-in slide-in-from-top-2 duration-300", PROCESS_COLORS[currentCard.correctProcess])}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">{getProcessLabel(currentCard.correctProcess)}</span>
                  </div>
                </Card>
              </div>

              {/* Expert's Reasoning */}
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{t("workedExample.expertReasoning")}</span>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm leading-relaxed">{currentCard.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              onClick={handlePrevious}
              disabled={currentCardIndex === 0}
              variant="outline"
              data-testid="button-previous-example"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("workedExample.previous")}
            </Button>

            <Button
              onClick={handleNext}
              disabled={!hasGuessed}
              size="lg"
              data-testid={isLastCard ? "button-start-synthesis" : "button-next-example"}
            >
              {isLastCard ? t("workedExample.readyToSummarize") : t("workedExample.next")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
