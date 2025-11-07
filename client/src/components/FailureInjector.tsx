import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FailureMode, AgentProcess } from "@shared/schema";
import { getProcessColor } from "@/lib/processColors";
import { AlertTriangle, Bug, Database, Wifi, Brain, Zap } from "lucide-react";

const FAILURE_ICONS: Record<string, any> = {
  memory: Database,
  tool: Wifi,
  reasoning: Brain,
  execution: Zap,
  perception: Bug,
};

type FailureInjectorProps = {
  failures: FailureMode[];
  onToggle: (failureId: string, enabled: boolean) => void;
};

export function FailureInjector({ failures, onToggle }: FailureInjectorProps) {
  const { t } = useTranslation();
  const activeCount = failures.filter((f) => f.enabled).length;
  
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <h3 className="font-semibold text-lg">{t("failureInjection.title")}</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("failureInjection.description")}
      </p>

      <div className="space-y-3">
        {failures.map((failure) => {
          const colors = getProcessColor(failure.affectedProcess);
          const Icon = FAILURE_ICONS[failure.id.split("-")[0]] || Bug;

          return (
            <div
              key={failure.id}
              className="flex items-start gap-3 p-3 border rounded-md hover-elevate transition-all"
              data-testid={`failure-toggle-${failure.id}`}
            >
              <Switch
                id={failure.id}
                checked={failure.enabled}
                onCheckedChange={(checked) => onToggle(failure.id, checked)}
                data-testid={`switch-${failure.id}`}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor={failure.id} className="font-medium cursor-pointer">
                    {failure.name}
                  </Label>
                  <Badge className={`${colors.bg} ${colors.text} text-xs`}>
                    {failure.affectedProcess}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{failure.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {activeCount > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            {t(`failureInjection.activeMessage`, { count: activeCount })}
          </p>
        </div>
      )}
    </Card>
  );
}
