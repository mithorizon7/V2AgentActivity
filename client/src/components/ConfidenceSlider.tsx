import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type ConfidenceSliderProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function ConfidenceSlider({
  value,
  onChange,
  disabled = false,
}: ConfidenceSliderProps) {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-3 p-6 bg-card rounded-md border" data-testid="confidence-slider">
      <div className="flex items-center justify-between">
        <Label htmlFor="confidence" className="text-base font-semibold">
          {t("confidence.title")}
        </Label>
        <span
          className="text-2xl font-bold text-primary tabular-nums"
          data-testid="confidence-value"
        >
          {value}%
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("confidence.question")}
      </p>
      <Slider
        id="confidence"
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={0}
        max={100}
        step={5}
        disabled={disabled}
        className="w-full"
        data-testid="confidence-slider-input"
        aria-label={t("confidence.question")}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{t("confidence.notConfident")}</span>
        <span>{t("confidence.somewhatConfident")}</span>
        <span>{t("confidence.veryConfident")}</span>
      </div>
    </div>
  );
}
