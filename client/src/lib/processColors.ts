import { AgentProcess } from "@shared/schema";

export const processColors: Record<AgentProcess, { bg: string; text: string; border: string }> = {
  learning: {
    bg: "bg-process-learning",
    text: "text-process-learning-foreground",
    border: "border-process-learning",
  },
  interaction: {
    bg: "bg-process-interaction",
    text: "text-process-interaction-foreground",
    border: "border-process-interaction",
  },
  perception: {
    bg: "bg-process-perception",
    text: "text-process-perception-foreground",
    border: "border-process-perception",
  },
  reasoning: {
    bg: "bg-process-reasoning",
    text: "text-process-reasoning-foreground",
    border: "border-process-reasoning",
  },
  planning: {
    bg: "bg-process-planning",
    text: "text-process-planning-foreground",
    border: "border-process-planning",
  },
  execution: {
    bg: "bg-process-execution",
    text: "text-process-execution-foreground",
    border: "border-process-execution",
  },
};

export const getProcessColor = (process: AgentProcess) => processColors[process];
