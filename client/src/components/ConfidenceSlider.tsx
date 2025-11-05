import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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
  return (
    <div className="space-y-3 p-6 bg-card rounded-md border" data-testid="confidence-slider">
      <div className="flex items-center justify-between">
        <Label htmlFor="confidence" className="text-base font-semibold">
          Confidence Level
        </Label>
        <span
          className="text-2xl font-bold text-primary tabular-nums"
          data-testid="confidence-value"
        >
          {value}%
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        How confident are you in your classifications?
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
        aria-label="Confidence level slider from 0 to 100 percent"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Not confident</span>
        <span>Somewhat confident</span>
        <span>Very confident</span>
      </div>
    </div>
  );
}
