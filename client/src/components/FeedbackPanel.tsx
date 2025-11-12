import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, XCircle, AlertTriangle, Lightbulb } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

type FeedbackItem = {
  type: "correct" | "incorrect" | "hint" | "confusion";
  title: string;
  message: string;
  itemName?: string;
};

type FeedbackPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  accuracy: number;
  explanationQuality?: number;
  calibration?: number;
  feedback: FeedbackItem[];
};

export function FeedbackPanel({
  isOpen,
  onClose,
  accuracy,
  explanationQuality,
  calibration,
  feedback,
}: FeedbackPanelProps) {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed right-0 top-0 h-screen w-96 bg-card border-l shadow-2xl z-40 animate-in slide-in-from-right"
      data-testid="feedback-panel"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{t("feedbackPanel.title")}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-feedback"
            aria-label={t("feedbackPanel.closeLabel")}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t("assessment.metrics.classificationAccuracy")}</span>
                  <span className="text-lg font-bold text-primary" data-testid="accuracy-score">
                    {accuracy}%
                  </span>
                </div>
                <Progress value={accuracy} className="h-2" />
              </div>

              {explanationQuality !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t("assessment.metrics.explanationQuality")}</span>
                    <span className="text-lg font-bold text-primary" data-testid="explanation-score">
                      {explanationQuality}%
                    </span>
                  </div>
                  <Progress value={explanationQuality} className="h-2" />
                </div>
              )}

              {calibration !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t("assessment.metrics.calibrationScore")}</span>
                    <span
                      className="text-lg font-bold text-primary"
                      data-testid="calibration-score"
                    >
                      {calibration}%
                    </span>
                  </div>
                  <Progress value={calibration} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {t("feedbackPanel.calibrationDescription")}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                {t("feedbackPanel.detailedFeedback")}
              </h3>
              {feedback.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("feedbackPanel.noFeedback")}</p>
              ) : (
                feedback.map((item, index) => (
                  <Card key={index} className="p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      {item.type === "correct" && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      )}
                      {item.type === "incorrect" && (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      {item.type === "hint" && (
                        <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      )}
                      {item.type === "confusion" && (
                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold">{item.title}</p>
                          {item.itemName && (
                            <Badge variant="outline" className="text-xs">
                              {item.itemName}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
