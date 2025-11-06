import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Block, Process } from "@shared/runtime/types";
import { getProcessColor } from "@/lib/processColors";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import {
  Eye,
  Lightbulb,
  Target,
  Play,
  ChevronRight,
  Check,
  Brain,
  Wrench,
} from "lucide-react";

const PROCESS_ICONS: Record<Process, React.ComponentType<{ className?: string }>> = {
  perception: Eye,
  reasoning: Lightbulb,
  planning: Target,
  execution: Play,
};


type FixedPipelineBuilderProps = {
  perceptionBlocks: Block[];
  reasoningBlocks: Block[];
  planningBlocks: Block[];
  executionBlocks: Block[];
  selectedBlocks: Record<Process, Block | null>;
  onBlockSelect: (process: Process, block: Block) => void;
};

export function FixedPipelineBuilder({
  perceptionBlocks,
  reasoningBlocks,
  planningBlocks,
  executionBlocks,
  selectedBlocks,
  onBlockSelect,
}: FixedPipelineBuilderProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentProcess, setCurrentProcess] = useState<Process | null>(null);

  const getProcessLabel = (process: Process) => ({
    simple: t(`circuit.slotLabels.${process}`),
    formal: t(`circuit.slotLabelsFormal.${process}`),
  });

  const getBlocksForProcess = (process: Process): Block[] => {
    switch (process) {
      case "perception":
        return perceptionBlocks;
      case "reasoning":
        return reasoningBlocks;
      case "planning":
        return planningBlocks;
      case "execution":
        return executionBlocks;
    }
  };

  const handleSlotClick = (process: Process) => {
    setCurrentProcess(process);
    setDialogOpen(true);
  };

  const handleBlockChoice = (block: Block) => {
    if (currentProcess) {
      onBlockSelect(currentProcess, block);
      setDialogOpen(false);
      setCurrentProcess(null);
    }
  };

  const processes: Process[] = ["perception", "reasoning", "planning", "execution"];
  const allSelected = processes.every((p) => selectedBlocks[p] !== null);

  return (
    <div className="space-y-6">
      <div className="p-6 border rounded-md bg-card">
        {/* 4+2 Model Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg">{t("model.title")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("model.runLoop.description")}
            </p>
          </div>
          {allSelected && (
            <Badge variant="default" className="gap-1">
              <Check className="w-3 h-3" />
              {t("circuit.pipelineComplete")}
            </Badge>
          )}
        </div>

        {/* Memory Rail (Top) */}
        <div className="mb-4 p-3 rounded-md bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              {t("model.supporting.memory.title")}
            </span>
            <span className="text-xs text-purple-600/70 dark:text-purple-400/70">
              {t("model.supporting.memory.description")}
            </span>
          </div>
        </div>

        {/* 4-Slot Pipeline */}
        <div className="flex items-center gap-3">
          {processes.map((process, index) => {
            const Icon = PROCESS_ICONS[process];
            const colors = getProcessColor(process as any);
            const selectedBlock = selectedBlocks[process];

            return (
              <div key={process} className="flex items-center gap-3 flex-1">
                <Card
                  className={cn(
                    "flex-1 p-4 cursor-pointer transition-all hover-elevate active-elevate-2 relative",
                    selectedBlock ? "border-2" : "border-2 border-dashed"
                  )}
                  onClick={() => handleSlotClick(process)}
                  data-testid={`pipeline-slot-${process}`}
                >
                  {/* Rail tap indicators */}
                  {selectedBlock && selectedBlock.usesMemory && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-purple-500/50" />
                  )}
                  {selectedBlock && selectedBlock.toolCalls && selectedBlock.toolCalls.length > 0 && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-blue-500/50" />
                  )}
                  
                  <div className="space-y-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", colors.bg)} />
                        <span className="font-semibold text-sm">
                          {getProcessLabel(process).simple}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground pl-4">
                        ({getProcessLabel(process).formal})
                      </span>
                    </div>
                    
                    {selectedBlock ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-sm">{t(selectedBlock.label)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {t(selectedBlock.description)}
                        </p>
                        {/* Rail badges */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedBlock.usesMemory && (
                            <Badge variant="outline" className="text-xs gap-1 bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300">
                              <Brain className="w-3 h-3" />
                              {t("model.supporting.memory.badge")}
                            </Badge>
                          )}
                          {selectedBlock.toolCalls && selectedBlock.toolCalls.map((tool) => (
                            <Badge key={tool} variant="outline" className="text-xs gap-1 bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300">
                              <Wrench className="w-3 h-3" />
                              {t("model.supporting.tools.badge", { tool })}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-12 text-xs text-muted-foreground">
                        {t("circuit.clickToChoose")}
                      </div>
                    )}
                  </div>
                </Card>

                {index < processes.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Tools/UI Rail (Bottom) */}
        <div className="mt-4 p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {t("model.supporting.tools.title")}
            </span>
            <span className="text-xs text-blue-600/70 dark:text-blue-400/70">
              {t("model.supporting.tools.description")}
            </span>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentProcess && getProcessLabel(currentProcess).simple}
            </DialogTitle>
            <DialogDescription>
              {currentProcess && t("circuit.dialogPrompt", { action: t(`circuit.dialogDescriptions.${currentProcess}`) })}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 mt-4">
            {currentProcess &&
              getBlocksForProcess(currentProcess).map((block) => {
                const Icon = PROCESS_ICONS[currentProcess];
                const colors = getProcessColor(currentProcess as any);
                const isSelected = selectedBlocks[currentProcess]?.id === block.id;

                return (
                  <Card
                    key={block.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover-elevate active-elevate-2",
                      isSelected && "border-2 border-primary"
                    )}
                    onClick={() => handleBlockChoice(block)}
                    data-testid={`block-option-${block.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-md", colors.bg)}>
                        <Icon className={cn("w-5 h-5", colors.text)} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{t(block.label)}</span>
                          {isSelected && (
                            <Badge variant="default" className="text-xs">
                              {t("circuit.selected")}
                            </Badge>
                          )}
                          {block.usesMemory && (
                            <Badge variant="outline" className="text-xs gap-1 bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300">
                              <Brain className="w-3 h-3" />
                              {t("model.supporting.memory.badge")}
                            </Badge>
                          )}
                          {block.toolCalls && block.toolCalls.map((tool) => (
                            <Badge key={tool} variant="outline" className="text-xs gap-1 bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300">
                              <Wrench className="w-3 h-3" />
                              {t("model.supporting.tools.badge", { tool })}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t(block.description)}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
