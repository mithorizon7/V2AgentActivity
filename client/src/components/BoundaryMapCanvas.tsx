import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BoundaryElement, BoundaryConnection, AgentProcess } from "@shared/schema";
import { getProcessColor } from "@/lib/processColors";
import { Database, Wifi, Activity, Monitor, FileText, Trash2, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

const ELEMENT_ICONS = {
  api: Wifi,
  memory: Database,
  sensor: Activity,
  ui: Monitor,
  log: FileText,
};

type DraggableElement = {
  id: string;
  labelKey: string;
  type: "api" | "memory" | "sensor" | "ui" | "log";
};

const AVAILABLE_ELEMENTS: DraggableElement[] = [
  { id: "wearable-api", labelKey: "boundaryMap.elements.wearableApi", type: "sensor" },
  { id: "calendar-api", labelKey: "boundaryMap.elements.calendarApi", type: "api" },
  { id: "user-memory", labelKey: "boundaryMap.elements.userMemory", type: "memory" },
  { id: "notification-ui", labelKey: "boundaryMap.elements.notificationUi", type: "ui" },
  { id: "activity-log", labelKey: "boundaryMap.elements.activityLog", type: "log" },
  { id: "health-db", labelKey: "boundaryMap.elements.healthDb", type: "memory" },
  { id: "sensor-stream", labelKey: "boundaryMap.elements.sensorStream", type: "sensor" },
  { id: "chat-interface", labelKey: "boundaryMap.elements.chatInterface", type: "ui" },
];

type BoundaryMapCanvasProps = {
  onSave: (elements: BoundaryElement[], connections: BoundaryConnection[]) => void;
  initialElements?: BoundaryElement[];
  initialConnections?: BoundaryConnection[];
};

export function BoundaryMapCanvas({
  onSave,
  initialElements = [],
  initialConnections = [],
}: BoundaryMapCanvasProps) {
  const { t } = useTranslation();
  const [placedElements, setPlacedElements] = useState<BoundaryElement[]>(initialElements);
  const [connections, setConnections] = useState<BoundaryConnection[]>(initialConnections);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<AgentProcess | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [cursorX, setCursorX] = useState(0);
  const [cursorY, setCursorY] = useState(0);
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const [focusMode, setFocusMode] = useState<"palette" | "canvas" | "processes">("palette");
  const [announcement, setAnnouncement] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const GRID_SIZE = 32;
  const CANVAS_WIDTH = 384;
  const CANVAS_HEIGHT = 384;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const elementData = e.dataTransfer.getData("element");
    if (!elementData || !canvasRef.current) return;

    const element: DraggableElement = JSON.parse(elementData);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newElement: BoundaryElement = {
      id: `${element.id}-${Date.now()}`,
      label: t(element.labelKey),
      type: element.type,
      x,
      y,
    };

    setPlacedElements((prev) => [...prev, newElement]);
  }, [t]);

  const handleElementClick = useCallback((elementId: string) => {
    setSelectedElement(elementId);
  }, []);

  const handleProcessClick = useCallback((process: AgentProcess) => {
    if (!selectedElement) return;

    const existingConnection = connections.find(
      (c) => c.elementId === selectedElement && c.process === process
    );

    if (existingConnection) {
      setConnections((prev) => prev.filter((c) => c.id !== existingConnection.id));
    } else {
      const newConnection: BoundaryConnection = {
        id: `${selectedElement}-${process}-${Date.now()}`,
        elementId: selectedElement,
        process,
      };
      setConnections((prev) => [...prev, newConnection]);
    }
  }, [selectedElement, connections]);

  const handleRemoveElement = useCallback((elementId: string) => {
    setPlacedElements((prev) => prev.filter((e) => e.id !== elementId));
    setConnections((prev) => prev.filter((c) => c.elementId !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  const handleSave = () => {
    onSave(placedElements, connections);
  };

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(""), 1000);
  }, []);

  const placeElementAtCursor = useCallback(() => {
    const element = AVAILABLE_ELEMENTS[selectedPaletteIndex];
    if (!element) return;

    const newElement: BoundaryElement = {
      id: `${element.id}-${Date.now()}`,
      label: t(element.labelKey),
      type: element.type,
      x: cursorX,
      y: cursorY,
    };

    setPlacedElements((prev) => [...prev, newElement]);
    announce(t("boundaryMap.keyboard.elementPlaced", { element: newElement.label, x: cursorX, y: cursorY }));
  }, [selectedPaletteIndex, cursorX, cursorY, t, announce]);

  const removeSelectedElement = useCallback(() => {
    if (!selectedElement) return;
    
    const element = placedElements.find(e => e.id === selectedElement);
    if (!element) return;

    handleRemoveElement(selectedElement);
    announce(t("boundaryMap.keyboard.elementRemoved", { element: element.label }));
  }, [selectedElement, placedElements, handleRemoveElement, t, announce]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (focusMode === "palette") {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const newIndex = Math.min(selectedPaletteIndex + 1, AVAILABLE_ELEMENTS.length - 1);
          setSelectedPaletteIndex(newIndex);
          announce(t(AVAILABLE_ELEMENTS[newIndex].labelKey));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const newIndex = Math.max(selectedPaletteIndex - 1, 0);
          setSelectedPaletteIndex(newIndex);
          announce(t(AVAILABLE_ELEMENTS[newIndex].labelKey));
        } else if (e.key === "Tab" && !e.shiftKey) {
          e.preventDefault();
          setFocusMode("canvas");
          announce(t("boundaryMap.keyboard.modeCanvas"));
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFocusMode("canvas");
          announce(t("boundaryMap.keyboard.modeCanvas"));
        }
      } else if (focusMode === "canvas") {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          const shift = e.shiftKey ? 4 : GRID_SIZE;
          const newX = Math.min(cursorX + shift, CANVAS_WIDTH - 192);
          setCursorX(newX);
          announce(t("boundaryMap.keyboard.cursorMoved", { x: newX, y: cursorY }));
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          const shift = e.shiftKey ? 4 : GRID_SIZE;
          const newX = Math.max(cursorX - shift, 0);
          setCursorX(newX);
          announce(t("boundaryMap.keyboard.cursorMoved", { x: newX, y: cursorY }));
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          const shift = e.shiftKey ? 4 : GRID_SIZE;
          const newY = Math.min(cursorY + shift, CANVAS_HEIGHT - 100);
          setCursorY(newY);
          announce(t("boundaryMap.keyboard.cursorMoved", { x: cursorX, y: newY }));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const shift = e.shiftKey ? 4 : GRID_SIZE;
          const newY = Math.max(cursorY - shift, 0);
          setCursorY(newY);
          announce(t("boundaryMap.keyboard.cursorMoved", { x: cursorX, y: newY }));
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          placeElementAtCursor();
        } else if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          removeSelectedElement();
        } else if (e.key === "Tab" && !e.shiftKey) {
          e.preventDefault();
          setFocusMode("processes");
          announce(t("boundaryMap.keyboard.modeProcesses"));
        } else if (e.key === "Tab" && e.shiftKey) {
          e.preventDefault();
          setFocusMode("palette");
          announce(t("boundaryMap.keyboard.modePalette"));
        } else if (e.key === "Escape") {
          e.preventDefault();
          setSelectedElement(null);
          announce(t("boundaryMap.keyboard.selectionCleared"));
        } else if (e.key === "Enter" && e.ctrlKey) {
          e.preventDefault();
          handleSave();
          announce(t("boundaryMap.keyboard.mapSaved"));
        }
      } else if (focusMode === "processes") {
        if (e.key === "Tab" && !e.shiftKey) {
          e.preventDefault();
          setFocusMode("palette");
          announce(t("boundaryMap.keyboard.modePalette"));
        } else if (e.key === "Tab" && e.shiftKey) {
          e.preventDefault();
          setFocusMode("canvas");
          announce(t("boundaryMap.keyboard.modeCanvas"));
        }
      }

      if (e.key === "?") {
        e.preventDefault();
        setShowInstructions(!showInstructions);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusMode, selectedPaletteIndex, cursorX, cursorY, selectedElement, showInstructions, placeElementAtCursor, removeSelectedElement, handleSave, announce, t]);


  return (
    <>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {!showInstructions && (
        <div className="mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowInstructions(true)}
            data-testid="button-show-keyboard-help"
            className="gap-2"
          >
            <Keyboard className="w-4 h-4" />
            {t("boundaryMap.keyboard.showShortcuts")}
          </Button>
        </div>
      )}

      {showInstructions && (
        <Card className="p-4 mb-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <Keyboard className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-2">{t("boundaryMap.keyboard.title")}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div><kbd className="px-1 py-0.5 bg-background rounded border">↑↓</kbd> {t("boundaryMap.keyboard.navigatePalette")}</div>
                <div><kbd className="px-1 py-0.5 bg-background rounded border">Enter</kbd> {t("boundaryMap.keyboard.enterCanvas")}</div>
                <div><kbd className="px-1 py-0.5 bg-background rounded border">←↑→↓</kbd> {t("boundaryMap.keyboard.moveCursor")}</div>
                <div><kbd className="px-1 py-0.5 bg-background rounded border">Shift+←↑→↓</kbd> {t("boundaryMap.keyboard.fineTune")}</div>
                <div><kbd className="px-1 py-0.5 bg-background rounded border">Space/Enter</kbd> {t("boundaryMap.keyboard.placeElement")}</div>
                <div><kbd className="px-1 py-0.5 bg-background rounded border">Del/Backspace</kbd> {t("boundaryMap.keyboard.removeElement")}</div>
                <div><kbd className="px-1 py-0.5 bg-background rounded border">Tab</kbd> {t("boundaryMap.keyboard.switchMode")}</div>
                <div><kbd className="px-1 py-0.5 bg-background rounded border">Ctrl+Enter</kbd> {t("boundaryMap.keyboard.save")}</div>
                <div><kbd className="px-1 py-0.5 bg-background rounded border">?</kbd> {t("boundaryMap.keyboard.toggleHelp")}</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setShowInstructions(false)}
              data-testid="button-hide-keyboard-help"
            >
              ×
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">{t("boundaryMap.availableElements")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("boundaryMap.dragInstruction")}
          </p>
          <div className="space-y-2" role="listbox" aria-label={t("boundaryMap.availableElements")}>
            {AVAILABLE_ELEMENTS.map((element, index) => {
              const Icon = ELEMENT_ICONS[element.type];
              const isKeyboardSelected = focusMode === "palette" && selectedPaletteIndex === index;
              return (
                <div
                  key={element.id}
                  role="option"
                  aria-selected={isKeyboardSelected}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("element", JSON.stringify(element));
                  }}
                  onClick={() => setSelectedPaletteIndex(index)}
                  className={cn(
                    "flex items-center gap-3 p-3 bg-card border-2 rounded-md cursor-move hover-elevate active-elevate-2 transition-all",
                    isKeyboardSelected && "ring-2 ring-primary border-primary"
                  )}
                  data-testid={`boundary-element-${element.id}`}
                >
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{t(element.labelKey)}</span>
                </div>
              );
            })}
          </div>
        </Card>

      <Card className="lg:col-span-2 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{t("boundaryMap.canvasTitle")}</h3>
            <Button onClick={handleSave} data-testid="button-save-boundary">
              {t("boundaryMap.saveMap")}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("boundaryMap.canvasDescription")}
          </p>
          <div
            ref={canvasRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative h-96 border-2 border-dashed rounded-md bg-muted/20"
            data-testid="boundary-canvas"
          >
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-10">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="border border-muted" />
              ))}
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 border-2 border-primary rounded-md flex items-center justify-center">
              <span className="font-bold text-sm text-primary">{t("boundaryMap.aiAgent")}</span>
            </div>

            {focusMode === "canvas" && (
              <div
                className="absolute w-48 h-20 border-4 border-dashed border-primary bg-primary/10 rounded-md pointer-events-none animate-pulse"
                style={{ left: cursorX, top: cursorY }}
                data-testid="keyboard-cursor"
                aria-hidden="true"
              />
            )}

            {placedElements.map((element) => {
              const Icon = ELEMENT_ICONS[element.type];
              const isSelected = selectedElement === element.id;
              const elementConnections = connections.filter((c) => c.elementId === element.id);

              return (
                <div
                  key={element.id}
                  onClick={() => handleElementClick(element.id)}
                  className={cn(
                    "absolute w-48 p-3 bg-card border-2 rounded-md cursor-pointer transition-all hover-elevate",
                    isSelected && "ring-2 ring-primary border-primary"
                  )}
                  style={{ left: element.x, top: element.y }}
                  data-testid={`placed-element-${element.id}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium flex-1">{element.label}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveElement(element.id);
                      }}
                      data-testid={`remove-element-${element.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {elementConnections.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {elementConnections.map((conn) => {
                        const colors = getProcessColor(conn.process);
                        return (
                          <Badge
                            key={conn.id}
                            className={`${colors.bg} ${colors.text} text-xs`}
                          >
                            {t(`processes.${conn.process}`)}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-lg">{t("boundaryMap.connectToProcess")}</h3>
        <p className="text-sm text-muted-foreground">
          {selectedElement
            ? t("boundaryMap.clickToConnect")
            : t("boundaryMap.selectFirst")}
        </p>
        <div className="space-y-2">
          {(["learning", "interaction", "perception", "reasoning", "planning", "execution"] as AgentProcess[]).map(
            (process) => {
              const colors = getProcessColor(process);
              const isConnected =
                selectedElement &&
                connections.some((c) => c.elementId === selectedElement && c.process === process);

              return (
                <Button
                  key={process}
                  variant={isConnected ? "default" : "outline"}
                  className={cn(
                    "w-full justify-start gap-2",
                    isConnected && `${colors.bg} ${colors.text}`
                  )}
                  onClick={() => handleProcessClick(process)}
                  disabled={!selectedElement}
                  data-testid={`connect-process-${process}`}
                >
                  <div className={cn("w-3 h-3 rounded-full", colors.bg)} />
                  {t(`processes.${process}`)}
                </Button>
              );
            }
          )}
        </div>
      </Card>
    </div>
    </>
  );
}
