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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg">{t("circuit.pipelineTitle")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("circuit.pipelineDescription")}
            </p>
          </div>
          {allSelected && (
            <Badge variant="default" className="gap-1">
              <Check className="w-3 h-3" />
              {t("circuit.pipelineComplete")}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {processes.map((process, index) => {
            const Icon = PROCESS_ICONS[process];
            const colors = getProcessColor(process as any);
            const selectedBlock = selectedBlocks[process];

            return (
              <div key={process} className="flex items-center gap-3 flex-1">
                <Card
                  className={cn(
                    "flex-1 p-4 cursor-pointer transition-all hover-elevate active-elevate-2",
                    selectedBlock ? "border-2" : "border-2 border-dashed"
                  )}
                  onClick={() => handleSlotClick(process)}
                  data-testid={`pipeline-slot-${process}`}
                >
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
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{t(block.label)}</span>
                          {isSelected && (
                            <Badge variant="default" className="text-xs">
                              {t("circuit.selected")}
                            </Badge>
                          )}
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
