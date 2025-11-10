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
  const [check1Attempts, setCheck1Attempts] = useState(0);
  const [check2Attempts, setCheck2Attempts] = useState(0);

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
    setCheck1Attempts(prev => prev + 1);
    if (check1Answer === microChecks[0].correctIndex) {
      setTimeout(() => {
        setCurrentStep("check2");
        setShowCheck1Feedback(false);
        setCheck1Answer(null);
      }, 2000);
    }
  };

  const handleCheck2Submit = () => {
    setShowCheck2Feedback(true);
    setCheck2Attempts(prev => prev + 1);
    if (check2Answer === microChecks[1].correctIndex) {
      setTimeout(() => {
        setCurrentStep("complete");
        setShowCheck2Feedback(false);
        setCheck2Answer(null);
      }, 2000);
    }
  };

  const handleCheck1Retry = () => {
    setCheck1Answer(null);
    setShowCheck1Feedback(false);
  };

  const handleCheck2Retry = () => {
    setCheck2Answer(null);
    setShowCheck2Feedback(false);
  };

  const handleCheck1Continue = () => {
    setCurrentStep("check2");
    setShowCheck1Feedback(false);
    setCheck1Answer(null);
  };

  const handleCheck2Continue = () => {
    setCurrentStep("complete");
    setShowCheck2Feedback(false);
    setCheck2Answer(null);
  };

  const renderIntro = () => (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="flex justify-center gap-2" role="progressbar" aria-valuenow={1} aria-valuemin={1} aria-valuemax={5}>
        {[1, 2, 3, 4, 5].map((step) => (
          <div 
            key={step}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              step === 1 ? "w-12 bg-primary" : "w-8 bg-border"
            )}
          />
        ))}
      </div>

      {/* Header with exact design system scale: 32px */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-[2rem] font-bold tracking-tight leading-tight">{t("primer.title")}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{t("primer.subtitle")}</p>
      </div>

      <Card className="p-10 space-y-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight">{t("primer.intro.heading")}</h2>
          <p className="text-base text-foreground/80 leading-relaxed">
            {t("primer.intro.description").split('**').map((part, i) => 
              i % 2 === 0 ? part : <strong key={i} className="text-foreground font-semibold">{part}</strong>
            )}
          </p>
        </div>

        {/* 4-Step Run Loop with improved visual hierarchy */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 bg-gradient-to-r from-green-500 via-orange-500 via-pink-500 to-red-500 rounded-full flex-1" />
            <span className="text-base font-bold uppercase tracking-wide text-foreground/70">{t("primer.runLoop.title")}</span>
          </div>
          
          <div className="flex flex-wrap items-stretch gap-4">
            {[
              { key: "perception", color: "bg-green-500/10 border-green-500/20", icon: "1" },
              { key: "reasoning", color: "bg-orange-500/10 border-orange-500/20", icon: "2" },
              { key: "planning", color: "bg-pink-500/10 border-pink-500/20", icon: "3" },
              { key: "execution", color: "bg-red-500/10 border-red-500/20", icon: "4" }
            ].flatMap((step, idx) => {
              const elements = [
                <Card key={step.key} className={cn("p-6 border-2 flex-1 min-w-[240px] transition-all hover-elevate", step.color)}>
                  <div className="space-y-3">
                    <div className="text-base font-bold tracking-tight">{t(`primer.runLoop.${step.key}.name`)}</div>
                    <div className="font-medium text-sm text-foreground/60">{t(`primer.runLoop.${step.key}.label`)}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{t(`primer.runLoop.${step.key}.description`)}</div>
                  </div>
                </Card>
              ];
              
              if (idx < 3) {
                elements.push(
                  <div key={`arrow-${idx}`} className="hidden lg:flex items-center flex-shrink-0">
                    <ArrowRight className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                );
              }
              
              return elements;
            })}
          </div>
        </div>

        {/* Supporting Systems with improved spacing and hierarchy */}
        <div className="space-y-6 pt-8 border-t border-border/50">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold uppercase tracking-wide text-foreground/70">{t("primer.supporting.title")}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-2 bg-purple-500/5 border-purple-500/20 transition-all hover-elevate">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300 font-medium">
                  {t("primer.supporting.memory.badge")}
                </Badge>
              </div>
              <div className="font-bold text-base mb-2">{t("primer.supporting.memory.label")}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{t("primer.supporting.memory.description")}</div>
            </Card>

            <Card className="p-6 border-2 bg-blue-500/5 border-blue-500/20 transition-all hover-elevate">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Wrench className="w-6 h-6 text-blue-600" />
                </div>
                <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300 font-medium">
                  {t("primer.supporting.tools.badge")}
                </Badge>
              </div>
              <div className="font-bold text-base mb-2">{t("primer.supporting.tools.label")}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{t("primer.supporting.tools.description")}</div>
            </Card>
          </div>

          <div className="p-6 rounded-lg bg-muted/30 border border-border/50">
            <p className="font-bold text-base mb-3">{t("primer.supporting.crossCutting.title")}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("primer.supporting.crossCutting.description")}</p>
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <Button onClick={() => setCurrentStep("demo")} size="lg" className="min-w-48" data-testid="button-continue-to-demo">
            {t("primer.continueToDemo")}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderDemo = () => (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="flex justify-center gap-2" role="progressbar" aria-valuenow={2} aria-valuemin={1} aria-valuemax={5}>
        {[1, 2, 3, 4, 5].map((step) => (
          <div 
            key={step}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              step <= 2 ? "w-12 bg-primary" : "w-8 bg-border"
            )}
          />
        ))}
      </div>

      {/* Header with exact design system scale: 32px */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-[2rem] font-bold tracking-tight">{t("primer.demo.title")}</h2>
        <p className="text-lg text-muted-foreground leading-relaxed">{t("primer.demo.subtitle")}</p>
      </div>

      <Card className="p-10 space-y-10">
        {/* Context section with improved visual design */}
        <div className="p-6 rounded-lg bg-primary/5 border-2 border-primary/10">
          <p className="text-base text-foreground/80 whitespace-pre-line leading-relaxed">{t("primer.demo.context")}</p>
        </div>

        {/* 4 Steps with compliant accent treatment */}
        <div className="space-y-5">
          {[
            { step: 1, process: "perception", accentColor: "border-green-500/30", bgColor: "bg-green-500/5" },
            { step: 2, process: "reasoning", accentColor: "border-orange-500/30", bgColor: "bg-orange-500/5" },
            { step: 3, process: "planning", accentColor: "border-pink-500/30", bgColor: "bg-pink-500/5" },
            { step: 4, process: "execution", accentColor: "border-red-500/30", bgColor: "bg-red-500/5" }
          ].map(({ step, process, accentColor, bgColor }) => (
            <div key={process} className={cn("relative p-6 rounded-md border-2 transition-all hover-elevate", accentColor, bgColor, "space-y-3")}>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-3 py-1 text-sm font-bold">{step}</Badge>
                <span className="font-bold text-base">{t(`primer.demo.${process}.label`)}</span>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">{t(`primer.demo.${process}.example`)}</p>
            </div>
          ))}
        </div>

        {/* Supporting systems with improved visual design */}
        <div className="pt-8 border-t border-border/50 space-y-5">
          <div className="p-6 rounded-lg bg-purple-500/5 border-2 border-purple-500/10 transition-all hover-elevate">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-purple-500/10 flex-shrink-0">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div className="space-y-2 flex-1">
                <p className="font-bold text-base">{t("primer.demo.memory.label")}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("primer.demo.memory.example")}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 rounded-lg bg-blue-500/5 border-2 border-blue-500/10 transition-all hover-elevate">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-blue-500/10 flex-shrink-0">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-2 flex-1">
                <p className="font-bold text-base">{t("primer.demo.tools.label")}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("primer.demo.tools.example")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <Button onClick={() => setCurrentStep("check1")} size="lg" className="min-w-48" data-testid="button-continue-to-checks">
            {t("primer.continueToChecks")}
            <ArrowRight className="w-5 h-5 ml-2" />
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
    const handleRetry = checkIndex === 0 ? handleCheck1Retry : handleCheck2Retry;
    const handleContinue = checkIndex === 0 ? handleCheck1Continue : handleCheck2Continue;
    const attempts = checkIndex === 0 ? check1Attempts : check2Attempts;
    const isCorrect = selectedAnswer === check.correctIndex;

    return (
      <div className="space-y-8">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2" role="progressbar" aria-valuenow={checkIndex + 3} aria-valuemin={1} aria-valuemax={5}>
          {[1, 2, 3, 4, 5].map((step) => (
            <div 
              key={step}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                step <= checkIndex + 3 ? "w-12 bg-primary" : "w-8 bg-border"
              )}
            />
          ))}
        </div>

        <div className="text-center space-y-3">
          <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">{t("primer.check.badge", { number: checkIndex + 1, total: 2 })}</Badge>
          <h2 className="text-2xl font-semibold tracking-tight">{t("primer.check.title")}</h2>
        </div>

        <Card className="p-10 space-y-8">
          <div className="space-y-6">
            <p className="text-lg font-semibold text-center max-w-2xl mx-auto leading-relaxed">{check.question}</p>
            
            <div className="space-y-3">
              {check.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => !showFeedback && setAnswer(idx)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full p-5 rounded-md border-2 text-left transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    selectedAnswer === idx && !showFeedback && "border-primary bg-primary/5 ring-2 ring-primary/20",
                    selectedAnswer === idx && showFeedback && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                    selectedAnswer === idx && showFeedback && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-950",
                    selectedAnswer !== idx && !showFeedback && "border-border hover-elevate active-elevate-2",
                    showFeedback && "cursor-not-allowed opacity-90"
                  )}
                  data-testid={`check${checkIndex + 1}-option-${idx}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base leading-relaxed">{option}</span>
                    {showFeedback && selectedAnswer === idx && (
                      isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      )
                    )}
                  </div>
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className={cn(
                "p-6 rounded-lg border-2 animate-in fade-in slide-in-from-top-2 duration-300",
                isCorrect ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
              )}>
                <p className="text-base font-bold mb-2">
                  {isCorrect ? t("primer.check.correct") : t("primer.check.incorrect")}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{check.explanation}</p>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3 pt-4 flex-wrap">
            {!showFeedback ? (
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                size="lg"
                className="min-w-48"
                data-testid={`button-submit-check${checkIndex + 1}`}
              >
                {t("primer.check.submit")}
              </Button>
            ) : !isCorrect ? (
              <>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  size="lg"
                  className="min-w-48"
                  data-testid={`button-retry-check${checkIndex + 1}`}
                >
                  {t("primer.check.tryAgain")}
                </Button>
                {attempts >= 2 && (
                  <Button
                    onClick={handleContinue}
                    size="lg"
                    className="min-w-48"
                    data-testid={`button-continue-check${checkIndex + 1}`}
                  >
                    {t("primer.check.continueAnyway")}
                  </Button>
                )}
              </>
            ) : null}
          </div>
        </Card>
      </div>
    );
  };

  const renderComplete = () => (
    <div className="space-y-8">
      {/* Full progress */}
      <div className="flex justify-center gap-2" role="progressbar" aria-valuenow={5} aria-valuemin={1} aria-valuemax={5}>
        {[1, 2, 3, 4, 5].map((step) => (
          <div 
            key={step}
            className="h-1.5 w-12 rounded-full bg-primary transition-all duration-300"
          />
        ))}
      </div>

      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-950">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-[2rem] font-bold tracking-tight">{t("primer.complete.title")}</h2>
        <p className="text-lg text-muted-foreground leading-relaxed">{t("primer.complete.description")}</p>
      </div>

      <Card className="p-10">
        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-muted/30 border border-border/50">
            <p className="font-bold text-base mb-4">{t("primer.complete.remember.title")}</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span className="leading-relaxed">{t("primer.complete.remember.point1")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span className="leading-relaxed">{t("primer.complete.remember.point2")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span className="leading-relaxed">{t("primer.complete.remember.point3")}</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-center pt-4">
            <Button onClick={onComplete} size="lg" className="min-w-48" data-testid="button-complete-primer">
              {t("primer.complete.continue")}
              <ArrowRight className="w-5 h-5 ml-2" />
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
