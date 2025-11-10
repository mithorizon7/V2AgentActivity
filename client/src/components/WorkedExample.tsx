import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Lightbulb, AlertTriangle, CheckCircle2, Eye } from "lucide-react";
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
  isNearMiss?: boolean;
  nearMissProcess?: AgentProcess;
  nearMissExplanation?: string;
};

const PROCESS_COLORS: Record<AgentProcess, string> = {
  perception: "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300",
  reasoning: "bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-300",
  planning: "bg-pink-500/10 border-pink-500/20 text-pink-700 dark:text-pink-300",
  execution: "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300",
  learning: "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300",
  interaction: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300",
};

export function WorkedExample({ onComplete }: WorkedExampleProps) {
  const { t } = useTranslation();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());

  const exampleCards: ExampleCard[] = [
    {
      id: "parse-sensor",
      text: t("workedExample.cards.parseSensor.text"),
      correctProcess: "perception",
      explanation: t("workedExample.cards.parseSensor.explanation"),
    },
    {
      id: "threshold-check",
      text: t("workedExample.cards.thresholdCheck.text"),
      correctProcess: "reasoning",
      explanation: t("workedExample.cards.thresholdCheck.explanation"),
    },
    {
      id: "choose-action",
      text: t("workedExample.cards.chooseAction.text"),
      correctProcess: "planning",
      explanation: t("workedExample.cards.chooseAction.explanation"),
    },
    {
      id: "send-message",
      text: t("workedExample.cards.sendMessage.text"),
      correctProcess: "execution",
      explanation: t("workedExample.cards.sendMessage.explanation"),
    },
    {
      id: "store-baseline",
      text: t("workedExample.cards.storeBaseline.text"),
      correctProcess: "learning",
      explanation: t("workedExample.cards.storeBaseline.explanation"),
    },
    {
      id: "call-api",
      text: t("workedExample.cards.callApi.text"),
      correctProcess: "interaction",
      explanation: t("workedExample.cards.callApi.explanation"),
    },
    {
      id: "calendar-near-miss",
      text: t("workedExample.cards.calendarNearMiss.text"),
      correctProcess: "interaction",
      explanation: t("workedExample.cards.calendarNearMiss.explanation"),
      isNearMiss: true,
      nearMissProcess: "planning",
      nearMissExplanation: t("workedExample.cards.calendarNearMiss.nearMissExplanation"),
    },
  ];

  const currentCard = exampleCards[currentCardIndex];
  const isLastCard = currentCardIndex === exampleCards.length - 1;

  const handleNext = () => {
    if (isLastCard) {
      onComplete();
    } else {
      setCurrentCardIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
    }
  };

  const getProcessLabel = (process: AgentProcess) => {
    return t(`workedExample.processLabels.${process}`);
  };

  const isCurrentCardRevealed = revealedCards.has(currentCard.id);

  const handleRevealAnswer = () => {
    setRevealedCards(prev => new Set(prev).add(currentCard.id));
  };

  const handleRevealAll = () => {
    setRevealedCards(new Set(exampleCards.map(card => card.id)));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">{t("workedExample.title")}</h1>
          <p className="text-xl text-muted-foreground">{t("workedExample.subtitle")}</p>
          <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
            <Badge variant="outline">
              {t("workedExample.progress", { current: currentCardIndex + 1, total: exampleCards.length })}
            </Badge>
            <Button
              onClick={handleRevealAll}
              variant="ghost"
              size="sm"
              className="text-xs"
              data-testid="button-reveal-all"
            >
              <Eye className="w-3 h-3 mr-1" />
              {t("workedExample.revealAll")}
            </Button>
          </div>
        </div>

        <Card className="p-8 space-y-6">
          {/* Card being classified */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">{t("workedExample.cardLabel")}</span>
              {currentCard.isNearMiss && (
                <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {t("workedExample.nearMiss")}
                </Badge>
              )}
            </div>
            <Card className="p-6 border-2">
              <p className="text-lg font-medium">{currentCard.text}</p>
            </Card>
          </div>

          {/* Near-miss warning (if applicable) */}
          {currentCard.isNearMiss && currentCard.nearMissProcess && (
            <div className="p-4 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                    {t("workedExample.commonMistake")}
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    {t("workedExample.mightThink")} <span className="font-semibold">{getProcessLabel(currentCard.nearMissProcess)}</span> {t("workedExample.because")} {currentCard.nearMissExplanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expert classification */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold">{t("workedExample.expertClassifies")}</span>
            </div>

            {!isCurrentCardRevealed ? (
              <button
                onClick={handleRevealAnswer}
                aria-expanded={false}
                aria-controls={`answer-${currentCard.id}`}
                aria-label={t("workedExample.revealAnswer")}
                className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md transition-all"
                data-testid="button-reveal-answer"
              >
                <Card className={cn("p-4 border-2 relative overflow-hidden hover-elevate active-elevate-2 cursor-pointer", PROCESS_COLORS[currentCard.correctProcess])}>
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2 blur-md select-none" aria-hidden="true">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">{getProcessLabel(currentCard.correctProcess)}</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-background/95 px-4 py-2 rounded-md border">
                        <Eye className="w-4 h-4" />
                        <span>{t("workedExample.revealAnswer")}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </button>
            ) : (
              <div id={`answer-${currentCard.id}`} role="region" aria-live="polite">
                <Card className={cn("p-4 border-2 animate-in fade-in slide-in-from-top-2 duration-300", PROCESS_COLORS[currentCard.correctProcess])}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">{getProcessLabel(currentCard.correctProcess)}</span>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Expert explanation - only shown when revealed */}
          {isCurrentCardRevealed && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300" id={`explanation-${currentCard.id}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{t("workedExample.whyLabel")}</span>
              </div>
              <div className="p-4 rounded-md bg-muted/50">
                <p className="text-sm">{currentCard.explanation}</p>
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
              size="lg"
              data-testid={isLastCard ? "button-complete-examples" : "button-next-example"}
            >
              {isLastCard ? t("workedExample.startPractice") : t("workedExample.next")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Learning tip */}
        <Card className="p-4 bg-muted/30">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-semibold">{t("workedExample.tip.title")}</p>
              <p className="text-muted-foreground">{t("workedExample.tip.description")}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
