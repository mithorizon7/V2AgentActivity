import { useState, useCallback } from "react";
import { AgentProcess, ClassificationItem, ClassificationSubmission } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { getProcessColor } from "@/lib/processColors";
import { cn } from "@/lib/utils";
import { GripVertical, Check, X, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

type DraggableItemProps = {
  item: ClassificationItem;
  onDragStart: (item: ClassificationItem) => void;
  explanation: string;
  onExplanationChange: (itemId: string, explanation: string) => void;
  showFeedback: boolean;
  isCorrect?: boolean;
};

function DraggableItem({
  item,
  onDragStart,
  explanation,
  onExplanationChange,
  showFeedback,
  isCorrect,
}: DraggableItemProps) {
  return (
    <div className="space-y-2">
      <div
        draggable
        onDragStart={() => onDragStart(item)}
        className={cn(
          "flex items-center gap-2 p-3 rounded-md border-2 cursor-move transition-all hover-elevate active-elevate-2",
          "bg-card",
          showFeedback && isCorrect === true && "border-green-500 bg-green-50 dark:bg-green-950",
          showFeedback && isCorrect === false && "border-red-500 bg-red-50 dark:bg-red-950"
        )}
        data-testid={`classification-item-${item.id}`}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-medium flex-1">{item.text}</span>
        {showFeedback && (
          isCorrect ? (
            <Check className="w-5 h-5 text-green-600" data-testid={`item-correct-${item.id}`} />
          ) : (
            <X className="w-5 h-5 text-red-600" data-testid={`item-incorrect-${item.id}`} />
          )
        )}
      </div>
      <Textarea
        value={explanation}
        onChange={(e) => onExplanationChange(item.id, e.target.value)}
        placeholder="Explain why you placed this item here..."
        className="min-h-20 text-sm resize-none"
        data-testid={`explanation-input-${item.id}`}
        aria-label={`Explanation for ${item.text}`}
      />
    </div>
  );
}

type ProcessColumnProps = {
  process: AgentProcess;
  items: ClassificationItem[];
  onDrop: (process: AgentProcess) => void;
  onDragOver: (e: React.DragEvent) => void;
  showFeedback: boolean;
  explanations: Record<string, string>;
  onExplanationChange: (itemId: string, explanation: string) => void;
  onDragStart: (item: ClassificationItem) => void;
  correctAnswers?: Record<string, boolean>;
  hint?: string;
};

function ProcessColumn({
  process,
  items,
  onDrop,
  onDragOver,
  showFeedback,
  explanations,
  onExplanationChange,
  onDragStart,
  correctAnswers,
  hint,
}: ProcessColumnProps) {
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const colors = getProcessColor(process);

  return (
    <Card
      className={cn(
        "flex flex-col p-4 min-h-96 transition-all",
        isDraggedOver && "ring-2 ring-primary bg-primary/5"
      )}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggedOver(false);
        onDrop(process);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
        setIsDraggedOver(true);
      }}
      onDragLeave={() => setIsDraggedOver(false)}
      data-testid={`drop-zone-${process}`}
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b">
        <div className={cn("w-3 h-3 rounded-full", colors.bg)} />
        <h3 className="font-semibold text-base uppercase tracking-wide">
          {process}
        </h3>
        <Badge variant="secondary" className="ml-auto">
          {items.length}
        </Badge>
      </div>
      {hint && (
        <div className="mb-3 p-2 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 flex gap-2">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200">{hint}</p>
        </div>
      )}
      <div className="space-y-3 flex-1">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-md text-sm text-muted-foreground">
            Drag items here
          </div>
        ) : (
          items.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              onDragStart={onDragStart}
              explanation={explanations[item.id] || ""}
              onExplanationChange={onExplanationChange}
              showFeedback={showFeedback}
              isCorrect={correctAnswers?.[item.id]}
            />
          ))
        )}
      </div>
    </Card>
  );
}

type ClassificationActivityProps = {
  items: ClassificationItem[];
  onSubmit: (submissions: ClassificationSubmission[]) => void;
  onScramble?: () => void;
  showFeedback?: boolean;
  correctAnswers?: Record<string, boolean>;
};

export function ClassificationActivity({
  items,
  onSubmit,
  onScramble,
  showFeedback = false,
  correctAnswers,
}: ClassificationActivityProps) {
  const { t } = useTranslation();
  const [itemsByProcess, setItemsByProcess] = useState<Record<AgentProcess, ClassificationItem[]>>(() => {
    const grouped: Record<AgentProcess, ClassificationItem[]> = {
      learning: [],
      interaction: [],
      perception: [],
      reasoning: [],
      planning: [],
      execution: [],
    };
    items.forEach((item) => {
      grouped[item.correctProcess].push(item);
    });
    return grouped;
  });
  
  const [draggedItem, setDraggedItem] = useState<ClassificationItem | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});

  const getProcessHint = (process: AgentProcess): string | undefined => {
    if (process === "learning") return t("classification.hints.learning");
    if (process === "interaction") return t("classification.hints.interaction");
    return undefined;
  };

  const handleDragStart = useCallback((item: ClassificationItem) => {
    setDraggedItem(item);
  }, []);

  const handleDrop = useCallback((targetProcess: AgentProcess) => {
    if (!draggedItem) return;

    setItemsByProcess((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((process) => {
        newState[process as AgentProcess] = newState[process as AgentProcess].filter(
          (i) => i.id !== draggedItem.id
        );
      });
      newState[targetProcess] = [...newState[targetProcess], draggedItem];
      return newState;
    });

    setDraggedItem(null);
  }, [draggedItem]);

  const handleExplanationChange = useCallback((itemId: string, explanation: string) => {
    setExplanations((prev) => ({ ...prev, [itemId]: explanation }));
  }, []);

  const handleScramble = useCallback(() => {
    const allItems = Object.values(itemsByProcess).flat();
    const shuffled = [...allItems].sort(() => Math.random() - 0.5);
    
    const processes: AgentProcess[] = ["learning", "interaction", "perception", "reasoning", "planning", "execution"];
    const newGrouping: Record<AgentProcess, ClassificationItem[]> = {
      learning: [],
      interaction: [],
      perception: [],
      reasoning: [],
      planning: [],
      execution: [],
    };

    shuffled.forEach((item, index) => {
      const process = processes[Math.floor(Math.random() * processes.length)];
      newGrouping[process].push(item);
    });

    setItemsByProcess(newGrouping);
    if (onScramble) onScramble();
  }, [itemsByProcess, onScramble]);

  const handleSubmit = () => {
    const submissions: ClassificationSubmission[] = [];
    Object.entries(itemsByProcess).forEach(([process, processItems]) => {
      processItems.forEach((item) => {
        submissions.push({
          itemId: item.id,
          selectedProcess: process as AgentProcess,
          explanation: explanations[item.id] || "",
          isCorrect: item.correctProcess === process,
        });
      });
    });
    onSubmit(submissions);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Drag items to the correct process category and explain your reasoning
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleScramble}
            data-testid="button-scramble"
          >
            Scramble
          </Button>
          <Button
            onClick={handleSubmit}
            data-testid="button-solve"
          >
            Submit & Check
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {(["learning", "interaction", "perception", "reasoning", "planning", "execution"] as AgentProcess[]).map(
          (process) => (
            <ProcessColumn
              key={process}
              process={process}
              items={itemsByProcess[process]}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              showFeedback={showFeedback}
              explanations={explanations}
              onExplanationChange={handleExplanationChange}
              onDragStart={handleDragStart}
              correctAnswers={correctAnswers}
              hint={getProcessHint(process)}
            />
          )
        )}
      </div>
    </div>
  );
}
