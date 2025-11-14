import { useState, useCallback, useEffect, useRef } from "react";
import { AgentProcess, ClassificationItem, ClassificationSubmission } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProcessColor } from "@/lib/processColors";
import { cn } from "@/lib/utils";
import { GripVertical, Check, X, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "react-i18next";
import { useConsent, safeLocalStorage } from "@/hooks/useConsent";

type DraggableItemProps = {
  item: ClassificationItem;
  onDragStart: (item: ClassificationItem) => void;
  showFeedback: boolean;
  isCorrect?: boolean;
  isGrabbed?: boolean;
  isFocused?: boolean;
  onKeyboardGrab?: (item: ClassificationItem) => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent, item: ClassificationItem) => void;
};

function DraggableItem({
  item,
  onDragStart,
  showFeedback,
  isCorrect,
  isGrabbed = false,
  isFocused = false,
  onKeyboardGrab,
  onFocus,
  onKeyDown,
}: DraggableItemProps) {
  const { t } = useTranslation();
  const itemRef = useRef<HTMLDivElement>(null);
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    if (isFocused && itemRef.current) {
      itemRef.current.focus();
    }
  }, [isFocused]);

  const hintText = t(`classificationHints.${item.id}`);
  const showHint = showFeedback && isCorrect === false;

  return (
    <div
      ref={itemRef}
      draggable
      onDragStart={() => onDragStart(item)}
      onKeyDown={(e) => onKeyDown?.(e, item)}
      onFocus={onFocus}
      tabIndex={0}
      aria-pressed={isGrabbed}
      aria-label={
        isGrabbed 
          ? t("classification.accessibility.card.labelGrabbed", { 
              item: item.text,
              tab: t("keyboard.keyNames.tab"),
              enter: t("keyboard.keyNames.enter"),
              escape: t("keyboard.keyNames.escape")
            })
          : t("classification.accessibility.card.labelIdle", { 
              item: item.text,
              space: t("keyboard.keyNames.space"),
              enter: t("keyboard.keyNames.enter")
            })
      }
      className={cn(
        "flex items-center gap-2 p-4 min-h-[44px] rounded-md border-2 cursor-move transition-all hover-elevate active-elevate-2",
        "bg-card focus:outline-none touch-manipulation",
        isFocused && "ring-2 ring-primary ring-offset-2",
        isGrabbed && "border-dashed border-primary shadow-lg scale-105",
        showFeedback && isCorrect === true && "border-green-500 bg-green-50 dark:bg-green-950",
        showFeedback && isCorrect === false && "border-red-500 bg-red-50 dark:bg-red-950"
      )}
      data-testid={`classification-item-${item.id}`}
    >
      <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base font-medium leading-snug break-words">{item.text}</p>
      </div>
      {showFeedback && (
        isCorrect ? (
          <Check className="w-5 h-5 text-green-600" data-testid={`item-correct-${item.id}`} />
        ) : (
          <>
            <X className="w-5 h-5 text-red-600" data-testid={`item-incorrect-${item.id}`} />
            <Popover open={hintOpen} onOpenChange={setHintOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="flex-shrink-0"
                  aria-label={t("classification.hintButton", { item: item.text })}
                  data-testid={`hint-button-${item.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Info className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80"
                aria-describedby={`hint-content-${item.id}`}
                data-testid={`hint-popover-${item.id}`}
              >
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{t("classification.hintTitle")}</h4>
                  <p id={`hint-content-${item.id}`} className="text-sm text-muted-foreground">
                    {hintText}
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </>
        )
      )}
    </div>
  );
}

type ProcessColumnProps = {
  process: AgentProcess;
  items: ClassificationItem[];
  onDrop: (process: AgentProcess) => void;
  onDragOver: (e: React.DragEvent) => void;
  showFeedback: boolean;
  onDragStart: (item: ClassificationItem) => void;
  correctAnswers?: Record<string, boolean>;
  litmusTest?: string;
  grabbedItem?: ClassificationItem | null;
  focusedItem?: ClassificationItem | null;
  onItemKeyDown?: (e: React.KeyboardEvent, item: ClassificationItem) => void;
  onItemFocus?: (item: ClassificationItem) => void;
  isKeyboardFocused?: boolean;
};

function ProcessColumn({
  process,
  items,
  onDrop,
  onDragOver,
  showFeedback,
  onDragStart,
  correctAnswers,
  litmusTest,
  grabbedItem,
  focusedItem,
  onItemKeyDown,
  onItemFocus,
  isKeyboardFocused = false,
}: ProcessColumnProps) {
  const { t } = useTranslation();
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const colors = getProcessColor(process);

  const litmusId = litmusTest ? `litmus-${process}` : undefined;

  return (
    <Card
      role="region"
      aria-label={t("classification.accessibility.dropZone.label", { process: t(`processes.${process}`) })}
      aria-describedby={litmusId}
      className={cn(
        "flex flex-col p-4 min-h-72 transition-all",
        isDraggedOver && "ring-2 ring-primary bg-primary/5",
        isKeyboardFocused && grabbedItem && "ring-2 ring-primary"
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
      <div className="mb-4 pb-3 border-b space-y-2.5">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", colors.bg)} />
          <h3 className="font-semibold text-base uppercase tracking-wide">
            {t(`processes.${process}`)}
          </h3>
          <Badge variant="secondary" className="ml-auto">
            {items.length}
          </Badge>
        </div>
        {litmusTest && (
          <div id={litmusId} className="flex items-start gap-1.5 pl-5">
            <span className="text-base leading-tight font-medium text-foreground/80">
              {litmusTest}
            </span>
          </div>
        )}
      </div>
      <div className="space-y-3 flex-1">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-md text-sm text-muted-foreground">
            {t("classification.dragItemsHere")}
          </div>
        ) : (
          items.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              onDragStart={onDragStart}
              showFeedback={showFeedback}
              isCorrect={correctAnswers?.[item.id]}
              isGrabbed={grabbedItem?.id === item.id}
              isFocused={focusedItem?.id === item.id}
              onKeyDown={onItemKeyDown}
              onFocus={() => onItemFocus?.(item)}
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
  const { hasConsent } = useConsent();
  const storage = safeLocalStorage(hasConsent);
  
  // Keyboard navigation state
  const [grabbedItem, setGrabbedItem] = useState<ClassificationItem | null>(null);
  const [focusedItem, setFocusedItem] = useState<ClassificationItem | null>(() => {
    // Initialize with first item so keyboard users can tab into the cards
    return items[0] || null;
  });
  const [focusedProcess, setFocusedProcess] = useState<AgentProcess | null>(null);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>("");
  
  // CRITICAL FIX: Start with ALL cards UNSORTED and SHUFFLED
  // Never auto-place based on correctProcess - that's backwards pedagogy!
  const [unsortedItems, setUnsortedItems] = useState<ClassificationItem[]>(() => {
    const saved = storage.getItem("classification_unsorted_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to restore unsorted items");
      }
    }
    return [...items].sort(() => Math.random() - 0.5);
  });
  
  const [itemsByProcess, setItemsByProcess] = useState<Record<AgentProcess, ClassificationItem[]>>(() => {
    const saved = storage.getItem("classification_sorted_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to restore sorted items");
      }
    }
    
    // Start with EMPTY bins - no pre-sorting!
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
  const hasWarnedRef = useRef(false);

  // Dev guard: warn if cards are in correct bins before user interaction
  // Only warn once on initial render to catch hardcoded pre-sorting bugs
  // Suppressed for legitimate localStorage restoration regardless of consent status
  useEffect(() => {
    if (import.meta.env.DEV && !hasWarnedRef.current) {
      const hasSavedState = storage.getItem("classification_sorted_v1");
      const autoPlaced: string[] = [];
      Object.entries(itemsByProcess).forEach(([process, processItems]) => {
        processItems.forEach(item => {
          if (item.correctProcess === process) {
            autoPlaced.push(`${item.id} → ${process}`);
          }
        });
      });
      if (autoPlaced.length > 0 && !showFeedback && !hasSavedState) {
        console.warn("⚠️ PRE-SORTED BUG:", autoPlaced);
      }
      hasWarnedRef.current = true;
    }
  }, []);

  const getLitmusTest = (process: AgentProcess): string => {
    return t(`processes.litmusTests.${process}`);
  };

  // Persist to localStorage whenever state changes (if consent granted)
  useEffect(() => {
    storage.setItem("classification_unsorted_v1", JSON.stringify(unsortedItems));
  }, [unsortedItems, hasConsent]);

  useEffect(() => {
    storage.setItem("classification_sorted_v1", JSON.stringify(itemsByProcess));
  }, [itemsByProcess, hasConsent]);

  const handleDragStart = useCallback((item: ClassificationItem) => {
    setDraggedItem(item);
  }, []);

  const handleDrop = useCallback((targetProcess: AgentProcess) => {
    if (!draggedItem) return;

    // Remove from unsorted tray if coming from there
    setUnsortedItems((prev) => prev.filter((i) => i.id !== draggedItem.id));

    // Remove from all bins and place in target
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

  const handleScramble = useCallback(() => {
    // Return ALL items to unsorted tray, shuffled
    const allItems = [
      ...unsortedItems,
      ...Object.values(itemsByProcess).flat()
    ];
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
    
    if (onScramble) onScramble();
  }, [unsortedItems, itemsByProcess, onScramble]);

  const handleSubmit = () => {
    const submissions: ClassificationSubmission[] = [];
    Object.entries(itemsByProcess).forEach(([process, processItems]) => {
      processItems.forEach((item) => {
        submissions.push({
          itemId: item.id,
          selectedProcess: process as AgentProcess,
          explanation: "",
          isCorrect: item.correctProcess === process,
        });
      });
    });
    onSubmit(submissions);
  };

  const announce = (message: string) => {
    setAriaAnnouncement(message);
    setTimeout(() => setAriaAnnouncement(""), 1000);
  };

  const handleKeyboardGrab = (item: ClassificationItem) => {
    if (!grabbedItem) {
      setGrabbedItem(item);
      setFocusedItem(item);
      announce(t("classification.accessibility.announcements.grabbed", { 
        item: item.text,
        tab: t("keyboard.keyNames.tab"),
        enter: t("keyboard.keyNames.enter"),
        escape: t("keyboard.keyNames.escape")
      }));
    } else if (grabbedItem.id === item.id) {
      // Drop in same location (cancel)
      setGrabbedItem(null);
      announce(t("classification.accessibility.announcements.droppedSameLocation", { item: item.text }));
    } else {
      // Can't grab another item while one is grabbed
      announce(t("classification.accessibility.announcements.releaseFirst", { 
        escape: t("keyboard.keyNames.escape") 
      }));
    }
  };

  const handleKeyboardDrop = (targetProcess: AgentProcess) => {
    if (!grabbedItem) return;

    // Remove from unsorted tray if coming from there
    setUnsortedItems((prev) => prev.filter((i) => i.id !== grabbedItem.id));

    // Remove from all bins and place in target
    setItemsByProcess((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((process) => {
        newState[process as AgentProcess] = newState[process as AgentProcess].filter(
          (i) => i.id !== grabbedItem.id
        );
      });
      newState[targetProcess] = [...newState[targetProcess], grabbedItem];
      return newState;
    });

    announce(t("classification.accessibility.announcements.dropped", { 
      item: grabbedItem.text, 
      process: targetProcess 
    }));
    setGrabbedItem(null);
    // Keep focus on the dropped item so user can continue interacting with it
    setFocusedItem(grabbedItem);
    setFocusedProcess(targetProcess);
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, item: ClassificationItem) => {
    // Get all items in the current container (unsorted or specific process)
    let containerItems: ClassificationItem[] = [];
    let isInUnsorted = unsortedItems.some(i => i.id === item.id);
    
    if (isInUnsorted) {
      containerItems = unsortedItems;
    } else {
      // Find which process column this item is in
      for (const process of processes) {
        if (itemsByProcess[process].some(i => i.id === item.id)) {
          containerItems = itemsByProcess[process];
          break;
        }
      }
    }

    const currentIndex = containerItems.findIndex(i => i.id === item.id);

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleKeyboardGrab(item);
    } else if (e.key === 'Escape' && grabbedItem) {
      e.preventDefault();
      setGrabbedItem(null);
      announce(t("classification.accessibility.announcements.cancelled", { item: item.text }));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (e.key === 'ArrowDown' && currentIndex < containerItems.length - 1) {
        setFocusedItem(containerItems[currentIndex + 1]);
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        setFocusedItem(containerItems[currentIndex - 1]);
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      if (containerItems.length > 0) {
        setFocusedItem(containerItems[0]);
      }
    } else if (e.key === 'End') {
      e.preventDefault();
      if (containerItems.length > 0) {
        setFocusedItem(containerItems[containerItems.length - 1]);
      }
    } else if (e.key === 'Tab' && grabbedItem) {
      // Let Tab work normally to navigate to process columns
      setFocusedProcess(null);
    }
  };

  const processes: AgentProcess[] = ["learning", "interaction", "perception", "reasoning", "planning", "execution"];
  
  // Refs for process column wrappers to manage focus
  const processRefs = useRef<Map<AgentProcess, HTMLDivElement>>(new Map());

  // Add keyboard handler for process columns
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!grabbedItem) return;
      
      if (e.key === 'Escape') {
        e.preventDefault();
        setGrabbedItem(null);
        announce(t("classification.accessibility.announcements.dropCancelled"));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        
        // Find current focused process or default to first
        const currentIndex = focusedProcess ? processes.indexOf(focusedProcess) : 0;
        const nextIndex = e.key === 'ArrowRight'
          ? Math.min(currentIndex + 1, processes.length - 1)
          : Math.max(currentIndex - 1, 0);
        
        const nextProcess = processes[nextIndex];
        setFocusedProcess(nextProcess);
        
        // Actually move DOM focus to the target process column
        const targetRef = processRefs.current.get(nextProcess);
        if (targetRef) {
          targetRef.focus();
        }
        
        announce(t("classification.accessibility.announcements.navigatedToZone", { 
          process: nextProcess,
          enter: t("keyboard.keyNames.enter")
        }));
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [grabbedItem, focusedProcess]);

  return (
    <div className="space-y-6">
      {/* ARIA Live Region for screen reader announcements */}
      <div className="sr-only" role="status" aria-live="assertive" aria-atomic="true">
        {ariaAnnouncement}
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-0">
        <p className="text-sm sm:text-base text-muted-foreground flex-1">
          {t("classification.dragInstruction")}
          <br className="hidden sm:block" />
          <span className="text-xs hidden sm:inline">
            {t("classification.accessibility.instructions", {
              tab: `${t("keyboard.keyNames.tab")}/${t("keyboard.keyNames.shiftTab")}`,
              arrowUpDown: `${t("keyboard.keyNames.arrowUp")}/${t("keyboard.keyNames.arrowDown")}`,
              spaceEnter: `${t("keyboard.keyNames.space")}/${t("keyboard.keyNames.enter")}`,
              escape: t("keyboard.keyNames.escape")
            })}
          </span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleScramble}
            data-testid="button-scramble"
            className="w-full sm:w-auto min-h-[44px]"
          >
            {t("classification.scramble")}
          </Button>
          <Button
            onClick={handleSubmit}
            data-testid="button-solve"
            className="w-full sm:w-auto min-h-[44px]"
          >
            {t("classification.submitCheck")}
          </Button>
        </div>
      </div>

      {/* Drop Zones - 6 process categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {processes.map((process) => (
          <div
            key={process}
            ref={(el) => {
              if (el) {
                processRefs.current.set(process, el);
              }
            }}
            tabIndex={grabbedItem ? 0 : -1}
            onFocus={() => {
              if (grabbedItem) {
                setFocusedProcess(process);
                announce(t("classification.accessibility.announcements.focusedOnZone", { 
                  process,
                  enter: t("keyboard.keyNames.enter")
                }));
              }
            }}
            onKeyDown={(e) => {
              if (grabbedItem && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleKeyboardDrop(process);
              } else if (grabbedItem && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                // Let the global handler manage arrow navigation
                // Don't call preventDefault here to allow global handler to work
              }
            }}
            className="focus:outline-none"
          >
            <ProcessColumn
              process={process}
              items={itemsByProcess[process]}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              showFeedback={showFeedback}
              onDragStart={handleDragStart}
              correctAnswers={correctAnswers}
              litmusTest={getLitmusTest(process)}
              grabbedItem={grabbedItem}
              focusedItem={focusedItem}
              onItemKeyDown={handleItemKeyDown}
              onItemFocus={setFocusedItem}
              isKeyboardFocused={focusedProcess === process}
            />
          </div>
        ))}
      </div>

      {/* Unsorted Tray - where all cards start */}
      {unsortedItems.length > 0 && (
        <Card className="p-4 sm:p-6 border-2 border-dashed">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm sm:text-base font-semibold">{t("classification.unsortedTray")}</span>
            <Badge variant="outline">{unsortedItems.length}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {unsortedItems.map((item) => (
              <DraggableItem
                key={item.id}
                item={item}
                onDragStart={handleDragStart}
                showFeedback={false}
                isGrabbed={grabbedItem?.id === item.id}
                isFocused={focusedItem?.id === item.id}
                onKeyDown={handleItemKeyDown}
                onFocus={() => setFocusedItem(item)}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
