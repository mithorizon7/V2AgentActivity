import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Wrench, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type PrimerProps = {
  onComplete: () => void;
};

type MicroCheck = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export function Primer({ onComplete }: PrimerProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<"intro" | "demo" | "check1" | "check2" | "complete">("intro");
  const [check1Answer, setCheck1Answer] = useState<number | null>(null);
  const [check2Answer, setCheck2Answer] = useState<number | null>(null);
  const [showCheck1Feedback, setShowCheck1Feedback] = useState(false);
  const [showCheck2Feedback, setShowCheck2Feedback] = useState(false);

  const microChecks: MicroCheck[] = [
    {
      question: t("primer.check1.question"),
      options: [
        t("primer.check1.option1"),
        t("primer.check1.option2"),
        t("primer.check1.option3"),
        t("primer.check1.option4")
      ],
      correctIndex: 2, // Planning
      explanation: t("primer.check1.explanation")
    },
    {
      question: t("primer.check2.question"),
      options: [
        t("primer.check2.option1"),
        t("primer.check2.option2"),
        t("primer.check2.option3"),
        t("primer.check2.option4")
      ],
      correctIndex: 3, // Interaction (Tools/UI)
      explanation: t("primer.check2.explanation")
    }
  ];

  const handleCheck1Submit = () => {
    setShowCheck1Feedback(true);
    if (check1Answer === microChecks[0].correctIndex) {
      setTimeout(() => {
        setCurrentStep("check2");
        setShowCheck1Feedback(false);
      }, 2000);
    }
  };

  const handleCheck2Submit = () => {
    setShowCheck2Feedback(true);
    if (check2Answer === microChecks[1].correctIndex) {
      setTimeout(() => {
        setCurrentStep("complete");
        setShowCheck2Feedback(false);
      }, 2000);
    }
  };

  const renderIntro = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">{t("primer.title")}</h1>
        <p className="text-xl text-muted-foreground">{t("primer.subtitle")}</p>
      </div>

      <Card className="p-8 space-y-6">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-semibold">{t("primer.intro.heading")}</h2>
          <p className="text-lg text-muted-foreground">
            {t("primer.intro.description").split('**').map((part, i) => 
              i % 2 === 0 ? part : <strong key={i}>{part}</strong>
            )}
          </p>
        </div>

        {/* 4-Step Run Loop */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 bg-gradient-to-r from-green-500 via-orange-500 via-pink-500 to-red-500 rounded-full flex-1" />
            <span className="text-sm font-semibold">{t("primer.runLoop.title")}</span>
          </div>
          
          <div className="flex items-stretch gap-3">
            {[
              { key: "perception", color: "bg-green-500/10 border-green-500/20", icon: "1" },
              { key: "reasoning", color: "bg-orange-500/10 border-orange-500/20", icon: "2" },
              { key: "planning", color: "bg-pink-500/10 border-pink-500/20", icon: "3" },
              { key: "execution", color: "bg-red-500/10 border-red-500/20", icon: "4" }
            ].map((step, idx) => (
              <>
                <Card key={step.key} className={cn("p-4 border-2 flex-1", step.color)}>
                  <div className="space-y-2">
                    <div className="font-bold text-base">{t(`primer.runLoop.${step.key}.name`)}</div>
                    <div className="font-semibold text-sm text-muted-foreground">{t(`primer.runLoop.${step.key}.label`)}</div>
                    <div className="text-xs text-muted-foreground">{t(`primer.runLoop.${step.key}.description`)}</div>
                  </div>
                </Card>
                {idx < 3 && (
                  <div key={`arrow-${idx}`} className="flex items-center">
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </>
            ))}
          </div>
        </div>

        {/* Supporting Systems (Rails) */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{t("primer.supporting.title")}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-2 bg-purple-500/5 border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300">
                  {t("primer.supporting.memory.badge")}
                </Badge>
              </div>
              <div className="font-semibold text-sm">{t("primer.supporting.memory.label")}</div>
              <div className="text-xs text-muted-foreground mt-1">{t("primer.supporting.memory.description")}</div>
            </Card>

            <Card className="p-4 border-2 bg-blue-500/5 border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300">
                  {t("primer.supporting.tools.badge")}
                </Badge>
              </div>
              <div className="font-semibold text-sm">{t("primer.supporting.tools.label")}</div>
              <div className="text-xs text-muted-foreground mt-1">{t("primer.supporting.tools.description")}</div>
            </Card>
          </div>

          <div className="p-3 rounded-md bg-muted/50 text-sm">
            <p className="font-semibold mb-1">{t("primer.supporting.crossCutting.title")}</p>
            <p className="text-muted-foreground text-xs">{t("primer.supporting.crossCutting.description")}</p>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button onClick={() => setCurrentStep("demo")} size="lg" data-testid="button-continue-to-demo">
            {t("primer.continueToDemo")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderDemo = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">{t("primer.demo.title")}</h2>
        <p className="text-lg text-muted-foreground">{t("primer.demo.subtitle")}</p>
      </div>

      <Card className="p-8 space-y-6">
        <div className="space-y-4">
          {[
            { step: 1, process: "perception", color: "border-green-500" },
            { step: 2, process: "reasoning", color: "border-orange-500" },
            { step: 3, process: "planning", color: "border-pink-500" },
            { step: 4, process: "execution", color: "border-red-500" }
          ].map(({ step, process, color }) => (
            <div key={process} className={cn("p-4 rounded-md border-l-4", color, "space-y-2")}>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{step}</Badge>
                <span className="font-semibold">{t(`primer.demo.${process}.label`)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t(`primer.demo.${process}.example`)}</p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="p-4 rounded-md bg-muted/50 space-y-2">
            <p className="font-semibold text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              {t("primer.demo.memory.label")}
            </p>
            <p className="text-xs text-muted-foreground">{t("primer.demo.memory.example")}</p>
          </div>
          
          <div className="p-4 rounded-md bg-muted/50 space-y-2 mt-3">
            <p className="font-semibold text-sm flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              {t("primer.demo.tools.label")}
            </p>
            <p className="text-xs text-muted-foreground">{t("primer.demo.tools.example")}</p>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button onClick={() => setCurrentStep("check1")} size="lg" data-testid="button-continue-to-checks">
            {t("primer.continueToChecks")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderMicroCheck = (checkIndex: 0 | 1) => {
    const check = microChecks[checkIndex];
    const selectedAnswer = checkIndex === 0 ? check1Answer : check2Answer;
    const setAnswer = checkIndex === 0 ? setCheck1Answer : setCheck2Answer;
    const showFeedback = checkIndex === 0 ? showCheck1Feedback : showCheck2Feedback;
    const handleSubmit = checkIndex === 0 ? handleCheck1Submit : handleCheck2Submit;
    const isCorrect = selectedAnswer === check.correctIndex;

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="mb-2">{t("primer.check.badge", { number: checkIndex + 1, total: 2 })}</Badge>
          <h2 className="text-2xl font-bold">{t("primer.check.title")}</h2>
        </div>

        <Card className="p-8 space-y-6">
          <div className="space-y-4">
            <p className="text-lg font-semibold">{check.question}</p>
            
            <div className="space-y-2">
              {check.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => !showFeedback && setAnswer(idx)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full p-4 rounded-md border-2 text-left transition-all",
                    selectedAnswer === idx && !showFeedback && "border-primary bg-primary/5",
                    selectedAnswer === idx && showFeedback && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                    selectedAnswer === idx && showFeedback && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-950",
                    selectedAnswer !== idx && "border-border hover-elevate",
                    showFeedback && "cursor-not-allowed"
                  )}
                  data-testid={`check${checkIndex + 1}-option-${idx}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showFeedback && selectedAnswer === idx && (
                      isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )
                    )}
                  </div>
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className={cn(
                "p-4 rounded-md",
                isCorrect ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
              )}>
                <p className="text-sm font-semibold mb-1">
                  {isCorrect ? t("primer.check.correct") : t("primer.check.incorrect")}
                </p>
                <p className="text-xs text-muted-foreground">{check.explanation}</p>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswer === null || showFeedback}
              size="lg"
              data-testid={`button-submit-check${checkIndex + 1}`}
            >
              {t("primer.check.submit")}
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  const renderComplete = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
        <h2 className="text-3xl font-bold">{t("primer.complete.title")}</h2>
        <p className="text-lg text-muted-foreground">{t("primer.complete.description")}</p>
      </div>

      <Card className="p-8">
        <div className="space-y-4">
          <div className="p-4 rounded-md bg-muted/50">
            <p className="font-semibold mb-2">{t("primer.complete.remember.title")}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• {t("primer.complete.remember.point1")}</li>
              <li>• {t("primer.complete.remember.point2")}</li>
              <li>• {t("primer.complete.remember.point3")}</li>
            </ul>
          </div>

          <div className="flex justify-center pt-4">
            <Button onClick={onComplete} size="lg" data-testid="button-complete-primer">
              {t("primer.complete.continue")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {currentStep === "intro" && renderIntro()}
      {currentStep === "demo" && renderDemo()}
      {currentStep === "check1" && renderMicroCheck(0)}
      {currentStep === "check2" && renderMicroCheck(1)}
      {currentStep === "complete" && renderComplete()}
    </div>
  );
}
