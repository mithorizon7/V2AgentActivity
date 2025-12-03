import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Brain, 
  Wrench, 
  CheckCircle2, 
  XCircle,
  MessageSquare,
  Database,
  Activity,
  History,
  Lightbulb,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

type MemoryConnectionsPracticeProps = {
  onComplete: () => void;
  onBack: () => void;
  isAlreadyComplete?: boolean;
};

type Exercise = {
  id: number;
  type: "memory" | "connection" | "retrieval";
  questionKey: string;
  options: { key: string; value: string; icon?: typeof Database }[];
  correctAnswer: string;
};

export function MemoryConnectionsPractice({ onComplete, onBack, isAlreadyComplete }: MemoryConnectionsPracticeProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<"intro" | "exercise" | "complete">(
    isAlreadyComplete ? "complete" : "intro"
  );
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const exercises: Exercise[] = [
    {
      id: 1,
      type: "memory",
      questionKey: "exercise1",
      options: [
        { key: "yes", value: t("memoryPractice.exercise1.options.yes") },
        { key: "no", value: t("memoryPractice.exercise1.options.no") },
      ],
      correctAnswer: "yes",
    },
    {
      id: 2,
      type: "connection",
      questionKey: "exercise2",
      options: [
        { key: "userDatabase", value: t("memoryPractice.exercise2.options.userDatabase"), icon: Database },
        { key: "healthApi", value: t("memoryPractice.exercise2.options.healthApi"), icon: Activity },
        { key: "chatHistory", value: t("memoryPractice.exercise2.options.chatHistory"), icon: History },
      ],
      correctAnswer: "healthApi",
    },
    {
      id: 3,
      type: "retrieval",
      questionKey: "exercise3",
      options: [
        { key: "yes", value: t("memoryPractice.exercise3.options.yes") },
        { key: "no", value: t("memoryPractice.exercise3.options.no") },
      ],
      correctAnswer: "yes",
    },
  ];

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setShowFeedback(true);
    if (selectedAnswer === exercises[currentExercise].correctAnswer) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise((c) => c + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setCurrentStep("complete");
    }
  };

  const renderIntro = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t("memoryPractice.title")}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t("memoryPractice.subtitle")}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-semibold text-center">{t("memoryPractice.introTitle")}</h2>
          <p className="text-sm text-muted-foreground text-center">
            {t("memoryPractice.introDescription")}
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4 border-2 border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Brain className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                    {t("memoryPractice.memoryTitle")}
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    {t("memoryPractice.memoryDescription")}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-50/50 to-transparent dark:from-cyan-950/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Wrench className="w-6 h-6 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-cyan-900 dark:text-cyan-100">
                    {t("memoryPractice.connectionsTitle")}
                  </h3>
                  <p className="text-sm text-cyan-700 dark:text-cyan-300 mt-1">
                    {t("memoryPractice.connectionsDescription")}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Card>
      </div>

      <Card className="p-6 max-w-4xl mx-auto border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">{t("memoryPractice.scenario.title")}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("memoryPractice.scenario.description")}
          </p>
          <Card className="p-4 bg-muted/50">
            <p className="text-sm italic">"{t("memoryPractice.scenario.context")}"</p>
          </Card>
        </div>
      </Card>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onBack} data-testid="button-memory-back">
          {t("common.back")}
        </Button>
        <Button onClick={() => setCurrentStep("exercise")} data-testid="button-start-exercises">
          {t("common.continue")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderExercise = () => {
    const exercise = exercises[currentExercise];
    const isCorrect = selectedAnswer === exercise.correctAnswer;
    const exerciseKey = exercise.questionKey;

    return (
      <div className="space-y-8">
        <div className="flex justify-center gap-2" role="progressbar" aria-valuenow={currentExercise + 1} aria-valuemin={1} aria-valuemax={exercises.length}>
          {exercises.map((_, idx) => (
            <div 
              key={idx}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                idx <= currentExercise ? "w-12 bg-primary" : "w-8 bg-border"
              )}
            />
          ))}
        </div>

        <div className="text-center">
          <Badge variant="outline" className="mb-4">
            {t("memoryPractice.progress", { current: currentExercise + 1, total: exercises.length })}
          </Badge>
        </div>

        <Card className="p-6 max-w-3xl mx-auto space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {exercise.type === "memory" && <Brain className="w-5 h-5 text-amber-600" />}
              {exercise.type === "connection" && <Wrench className="w-5 h-5 text-cyan-600" />}
              {exercise.type === "retrieval" && <Brain className="w-5 h-5 text-amber-600" />}
              <h2 className="text-xl font-semibold">
                {t(`memoryPractice.${exerciseKey}.title`)}
              </h2>
            </div>
            <p className="text-muted-foreground">
              {t(`memoryPractice.${exerciseKey}.question`)}
            </p>
          </div>

          <div className="space-y-3">
            {exercise.options.map((option) => {
              const isSelected = selectedAnswer === option.key;
              const isCorrectOption = option.key === exercise.correctAnswer;
              
              return (
                <button
                  key={option.key}
                  onClick={() => handleAnswerSelect(option.key)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-left transition-all min-h-[44px]",
                    "hover-elevate active-elevate-2",
                    !showFeedback && isSelected && "border-primary bg-primary/5",
                    !showFeedback && !isSelected && "border-border hover:border-primary/50",
                    showFeedback && isCorrectOption && "border-green-500 bg-green-50 dark:bg-green-950/20",
                    showFeedback && isSelected && !isCorrectOption && "border-red-500 bg-red-50 dark:bg-red-950/20"
                  )}
                  data-testid={`option-${option.key}`}
                >
                  <div className="flex items-center gap-3">
                    {option.icon && <option.icon className="w-5 h-5 text-muted-foreground" />}
                    <span className="font-medium">{option.value}</span>
                    {showFeedback && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                    {showFeedback && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <Card className={cn(
              "p-4",
              isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
            )}>
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <p className={cn(
                  "text-sm",
                  isCorrect ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"
                )}>
                  {isCorrect 
                    ? t(`memoryPractice.${exerciseKey}.correctFeedback`)
                    : t(`memoryPractice.${exerciseKey}.incorrectFeedback`)
                  }
                </p>
              </div>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            {!showFeedback ? (
              <Button 
                onClick={handleSubmit} 
                disabled={!selectedAnswer}
                data-testid="button-submit-answer"
              >
                {t("common.submit")}
              </Button>
            ) : (
              <Button onClick={handleNext} data-testid="button-next-exercise">
                {currentExercise < exercises.length - 1 ? t("common.continue") : t("common.continue")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const renderComplete = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 mb-4">
          <Sparkles className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t("memoryPractice.complete.title")}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t("memoryPractice.complete.description")}
        </p>
      </div>

      <Card className="p-6 max-w-2xl mx-auto space-y-4">
        <h3 className="font-semibold text-center">{t("memoryPractice.complete.keyTakeaways")}</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{t("memoryPractice.complete.takeaway1")}</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{t("memoryPractice.complete.takeaway2")}</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{t("memoryPractice.complete.takeaway3")}</span>
          </li>
        </ul>
      </Card>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => { setCurrentStep("intro"); setCurrentExercise(0); setCorrectCount(0); }} data-testid="button-retry-exercises">
          {t("common.reset")}
        </Button>
        <Button onClick={onComplete} data-testid="button-complete-memory-practice">
          {t("memoryPractice.complete.continueButton")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {currentStep === "intro" && renderIntro()}
      {currentStep === "exercise" && renderExercise()}
      {currentStep === "complete" && renderComplete()}
    </div>
  );
}
