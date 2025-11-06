import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AgentProcess, ClassificationItem, ClassificationSubmission } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Wrench, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type DraggableItemProps = {
  item: ClassificationItem;
  onDragStart: (item: ClassificationItem) => void;
  explanation: string;
  onExplanationChange: (itemId: string, explanation: string) => void;
  showFeedback?: boolean;
  isCorrect?: boolean;
  seedPrompts: string[];
  hint?: string;
};

function DraggableItem({
  item,
  onDragStart,
  explanation,
  onExplanationChange,
  showFeedback,
  isCorrect,
  seedPrompts,
  hint,
}: DraggableItemProps) {
  const { t } = useTranslation();
  const [selectedPrompt, setSelectedPrompt] = useState("");

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt);
    onExplanationChange(item.id, prompt);
  };

  return (
    <Card
      className={cn(
        "p-3 cursor-move hover-elevate active-elevate-2",
        showFeedback && (isCorrect ? "border-green-500" : "border-destructive")
      )}
      draggable
      onDragStart={() => onDragStart(item)}
      data-testid={`card-item-${item.id}`}
    >
      <div className="font-medium mb-2">{item.text}</div>
      <Textarea
        placeholder={t("classification.explainPlaceholder")}
        value={explanation}
        onChange={(e) => onExplanationChange(item.id, e.target.value)}
        className="text-sm min-h-20"
        data-testid={`input-explanation-${item.id}`}
      />
      {/* Seed prompts */}
      <div className="mt-2 flex flex-wrap gap-1">
        {seedPrompts.map((prompt, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            className="text-xs h-auto py-1"
            onClick={() => handlePromptClick(prompt)}
            data-testid={`button-seed-${item.id}-${idx}`}
          >
            {prompt}
          </Button>
        ))}
      </div>
      {/* Hint after 2 wrong attempts */}
      {hint && (
        <Alert className="mt-2 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
            {hint}
          </AlertDescription>
        </Alert>
      )}
      {showFeedback && isCorrect && (
        <div className="mt-2 flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>{t("classification.correct")}</span>
        </div>
      )}
    </Card>
  );
}

type ProcessColumnProps = {
  process: AgentProcess;
  items: ClassificationItem[];
  onDrop: (process: AgentProcess) => void;
  onDragOver: (e: React.DragEvent) => void;
  showFeedback?: boolean;
  explanations: Record<string, string>;
  onExplanationChange: (itemId: string, explanation: string) => void;
  onDragStart: (item: ClassificationItem) => void;
  correctAnswers?: Record<string, boolean>;
  seedPrompts: string[];
  hints: Record<string, string>;
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
  seedPrompts,
  hints,
}: ProcessColumnProps) {
  const { t } = useTranslation();
  
  const processConfig = {
    perception: { color: "bg-green-100 dark:bg-green-950", label: t("phases.perception"), dualLabel: t("phases.perceptionDual") },
    execution: { color: "bg-red-100 dark:bg-red-950", label: t("phases.execution"), dualLabel: t("phases.executionDual") },
  };

  const config = processConfig[process as keyof typeof processConfig];
  if (!config) return null;

  return (
    <Card
      className={cn("p-4 min-h-96", config.color)}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(process);
      }}
      onDragOver={onDragOver}
      data-testid={`bin-${process}`}
    >
      <div className="mb-4">
        <h3 className="font-semibold text-lg">{config.dualLabel}</h3>
        <Badge variant="outline" className="mt-1">{items.length}</Badge>
      </div>
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            {t("classification.dragItemsHere")}
          </p>
        )}
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            onDragStart={onDragStart}
            explanation={explanations[item.id] || ""}
            onExplanationChange={onExplanationChange}
            showFeedback={showFeedback}
            isCorrect={correctAnswers?.[item.id]}
            seedPrompts={seedPrompts}
            hint={hints[item.id]}
          />
        ))}
      </div>
    </Card>
  );
}

type Phase1GuidedProps = {
  items: ClassificationItem[];
  onComplete: () => void;
};

export function Phase1Guided({ items, onComplete }: Phase1GuidedProps) {
  const { t } = useTranslation();
  
  // Filter items for just Perception vs Execution
  const guidedItems = items.filter(
    item => item.correctProcess === "perception" || item.correctProcess === "execution"
  );
  
  const [unsortedItems, setUnsortedItems] = useState<ClassificationItem[]>(() => {
    const saved = localStorage.getItem("phase1_guided_unsorted_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to restore guided unsorted items");
      }
    }
    return [...guidedItems].sort(() => Math.random() - 0.5);
  });
  
  const [itemsByProcess, setItemsByProcess] = useState<Record<AgentProcess, ClassificationItem[]>>(() => {
    const saved = localStorage.getItem("phase1_guided_sorted_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to restore guided sorted items");
      }
    }
    return {
      learning: [],
      interaction: [],
      perception: [],
      reasoning: [],
      planning: [],
      execution: [],
    };
  });
  
  const [draggedItem, setDraggedItem] = useState<ClassificationItem | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("phase1_guided_explanations_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [attempts, setAttempts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("phase1_guided_attempts_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [hints, setHints] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    localStorage.setItem("phase1_guided_unsorted_v1", JSON.stringify(unsortedItems));
  }, [unsortedItems]);

  useEffect(() => {
    localStorage.setItem("phase1_guided_sorted_v1", JSON.stringify(itemsByProcess));
  }, [itemsByProcess]);

  useEffect(() => {
    localStorage.setItem("phase1_guided_explanations_v1", JSON.stringify(explanations));
  }, [explanations]);

  useEffect(() => {
    localStorage.setItem("phase1_guided_attempts_v1", JSON.stringify(attempts));
  }, [attempts]);

  const handleDragStart = useCallback((item: ClassificationItem) => {
    setDraggedItem(item);
  }, []);

  const handleDrop = useCallback((targetProcess: AgentProcess) => {
    if (!draggedItem) return;

    setUnsortedItems((prev) => prev.filter((i) => i.id !== draggedItem.id));

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
    const allItems = [
      ...unsortedItems,
      ...Object.values(itemsByProcess).flat()
    ].filter(item => item.correctProcess === "perception" || item.correctProcess === "execution");
    
    const shuffled = [...allItems].sort(() => Math.random() - 0.5);
    
    setUnsortedItems(shuffled);
    setItemsByProcess({
      learning: [],
      interaction: [],
      perception: [],
      reasoning: [],
      planning: [],
      execution: [],
    });
    setShowFeedback(false);
    setHints({});
  }, [unsortedItems, itemsByProcess]);

  const getSeedPrompts = (process: AgentProcess): string[] => {
    const prompts = {
      perception: [
        t("guided.seedPrompts.perception.1"),
        t("guided.seedPrompts.perception.2"),
        t("guided.seedPrompts.perception.3"),
      ],
      execution: [
        t("guided.seedPrompts.execution.1"),
        t("guided.seedPrompts.execution.2"),
        t("guided.seedPrompts.execution.3"),
      ],
    };
    return prompts[process as keyof typeof prompts] || [];
  };

  const handleSubmit = () => {
    const sortedItems = [...itemsByProcess.perception, ...itemsByProcess.execution];
    
    // Check all items are sorted
    if (sortedItems.length !== guidedItems.length) {
      alert(t("guided.sortAllItems"));
      return;
    }

    // Check all explanations present
    const missingExplanations = sortedItems.some(item => !explanations[item.id]?.trim());
    if (missingExplanations) {
      alert(t("classification.explanationRequired"));
      return;
    }

    // Check answers and track attempts
    const newCorrectAnswers: Record<string, boolean> = {};
    const newAttempts = { ...attempts };
    const newHints = { ...hints };

    sortedItems.forEach((item) => {
      const isCorrect = item.correctProcess === (
        itemsByProcess.perception.includes(item) ? "perception" : "execution"
      );
      newCorrectAnswers[item.id] = isCorrect;

      if (!isCorrect) {
        newAttempts[item.id] = (newAttempts[item.id] || 0) + 1;
        
        // Show hint after 2 wrong attempts
        if (newAttempts[item.id] >= 2) {
          newHints[item.id] = t("guided.contrastiveHint");
        }
      }
    });

    setCorrectAnswers(newCorrectAnswers);
    setAttempts(newAttempts);
    setHints(newHints);
    setShowFeedback(true);

    // Check if all correct
    const allCorrect = Object.values(newCorrectAnswers).every(v => v);
    if (allCorrect) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t("guided.title")}</h2>
        <p className="text-muted-foreground">{t("guided.description")}</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t("guided.dragInstruction")}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleScramble}
            data-testid="button-scramble-guided"
          >
            {t("classification.scramble")}
          </Button>
          <Button
            onClick={handleSubmit}
            data-testid="button-submit-guided"
          >
            {t("guided.checkAnswers")}
          </Button>
        </div>
      </div>

      {/* Unsorted Tray */}
      {unsortedItems.length > 0 && (
        <Card className="p-4 border-2 border-dashed">
          <div className="mb-2">
            <span className="text-sm font-semibold">{t("classification.unsortedTray")}</span>
            <Badge variant="outline" className="ml-2">{unsortedItems.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unsortedItems.map((item) => (
              <DraggableItem
                key={item.id}
                item={item}
                onDragStart={handleDragStart}
                explanation={explanations[item.id] || ""}
                onExplanationChange={handleExplanationChange}
                showFeedback={false}
                seedPrompts={getSeedPrompts(item.correctProcess)}
                hint={hints[item.id]}
              />
            ))}
          </div>
        </Card>
      )}

      {/* 2-bin layout: Perception vs Execution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProcessColumn
          process="perception"
          items={itemsByProcess.perception}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          showFeedback={showFeedback}
          explanations={explanations}
          onExplanationChange={handleExplanationChange}
          onDragStart={handleDragStart}
          correctAnswers={correctAnswers}
          seedPrompts={getSeedPrompts("perception")}
          hints={hints}
        />
        <ProcessColumn
          process="execution"
          items={itemsByProcess.execution}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          showFeedback={showFeedback}
          explanations={explanations}
          onExplanationChange={handleExplanationChange}
          onDragStart={handleDragStart}
          correctAnswers={correctAnswers}
          seedPrompts={getSeedPrompts("execution")}
          hints={hints}
        />
      </div>
    </div>
  );
}
