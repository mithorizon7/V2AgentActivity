import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Target, Brain, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Metric = {
  label: string;
  value: number;
  change?: number;
  target?: number;
};

type AssessmentDashboardProps = {
  metrics: {
    classificationAccuracy: number;
    explanationQuality: number;
    boundaryMapCompleteness: number;
    circuitCorrectness: number;
    calibration: number;
  };
  phaseCompletion: Record<string, boolean>;
};

export function AssessmentDashboard({
  metrics,
  phaseCompletion,
}: AssessmentDashboardProps) {
  const { t } = useTranslation();
  const completedPhases = Object.values(phaseCompletion).filter(Boolean).length;
  const totalPhases = Object.keys(phaseCompletion).length;
  const overallProgress = (completedPhases / totalPhases) * 100;

  const metricCards: Metric[] = [
    {
      label: t("assessment.metrics.classificationAccuracy"),
      value: metrics.classificationAccuracy,
      target: 80,
    },
    {
      label: t("assessment.metrics.explanationQuality"),
      value: metrics.explanationQuality,
      target: 70,
    },
    {
      label: t("assessment.metrics.boundaryMapCompleteness"),
      value: metrics.boundaryMapCompleteness,
      target: 75,
    },
    {
      label: t("assessment.metrics.circuitCorrectness"),
      value: metrics.circuitCorrectness,
      target: 80,
    },
    {
      label: t("assessment.metrics.calibrationScore"),
      value: metrics.calibration,
      target: 85,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{t("assessment.overallProgress")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("assessment.phasesCompleted", { completed: completedPhases, total: totalPhases })}
            </p>
          </div>
          <Badge
            variant={overallProgress === 100 ? "default" : "secondary"}
            className="text-lg px-4 py-2"
          >
            {overallProgress.toFixed(0)}%
          </Badge>
        </div>
        <Progress value={overallProgress} className="h-3" />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((metric, index) => {
          const meetsTarget = metric.target ? metric.value >= metric.target : false;
          const isClose = metric.target
            ? metric.value >= metric.target - 10 && metric.value < metric.target
            : false;

          return (
            <Card key={index} className="p-6 space-y-3" data-testid={`metric-card-${index}`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold" data-testid={`metric-value-${index}`}>
                      {metric.value}
                    </span>
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
                {meetsTarget ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : isClose ? (
                  <Target className="w-5 h-5 text-amber-600" />
                ) : (
                  <Brain className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {metric.target && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t("assessment.target", { value: metric.target })}</span>
                    <span
                      className={cn(
                        "font-medium",
                        meetsTarget && "text-green-600",
                        isClose && "text-amber-600",
                        !meetsTarget && !isClose && "text-muted-foreground"
                      )}
                    >
                      {metric.value >= metric.target
                        ? `+${metric.value - metric.target}%`
                        : `-${metric.target - metric.value}%`}
                    </span>
                  </div>
                  <Progress
                    value={(metric.value / metric.target) * 100}
                    className={cn(
                      "h-2",
                      meetsTarget && "[&>div]:bg-green-600",
                      isClose && "[&>div]:bg-amber-600"
                    )}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">{t("assessment.insights")}</h3>
        <div className="space-y-3">
          {metrics.calibration >= 85 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-green-900 dark:text-green-100">
                  {t("assessment.excellentCalibration")}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {t("assessment.excellentCalibrationDesc")}
                </p>
              </div>
            </div>
          )}

          {metrics.classificationAccuracy >= 80 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-blue-900 dark:text-blue-100">
                  {t("assessment.strongClassification")}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {t("assessment.strongClassificationDesc")}
                </p>
              </div>
            </div>
          )}

          {metrics.explanationQuality < 70 && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
              <Target className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-amber-900 dark:text-amber-100">
                  {t("assessment.improveExplanations")}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {t("assessment.improveExplanationsDesc")}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
