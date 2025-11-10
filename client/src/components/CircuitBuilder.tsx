import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ReactFlow, Node, Edge, Controls, Background, Connection, addEdge, NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AgentProcess } from "@shared/schema";
import { getProcessColor } from "@/lib/processColors";
import { cn } from "@/lib/utils";
import {
  Brain,
  MessageCircle,
  Eye,
  Lightbulb,
  Target,
  Play,
  Trash2,
  Keyboard,
} from "lucide-react";

const PROCESS_ICONS: Record<AgentProcess, React.ComponentType<{ className?: string }>> = {
  learning: Brain,
  interaction: MessageCircle,
  perception: Eye,
  reasoning: Lightbulb,
  planning: Target,
  execution: Play,
};

type BlockPaletteItem = {
  process: AgentProcess;
};

type CircuitBuilderProps = {
  onSave: (nodes: Node[], edges: Edge[]) => void;
  initialNodes?: Node[];
  initialEdges?: Edge[];
};

function ProcessNode({ data }: { data: any }) {
  const colors = getProcessColor(data.process as AgentProcess);
  const Icon = PROCESS_ICONS[data.process as AgentProcess];

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-md border-2 min-w-48 transition-all hover-elevate",
        colors.bg,
        colors.text
      )}
      data-testid={`circuit-node-${data.id}`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5" />
        <div className="flex-1">
          <div className="font-semibold text-sm">{data.label}</div>
          <div className="text-xs opacity-80">{data.description}</div>
        </div>
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  processNode: ProcessNode,
};

export function CircuitBuilder({
  onSave,
  initialNodes = [],
  initialEdges = [],
}: CircuitBuilderProps) {
  const { t } = useTranslation();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [showInstructions, setShowInstructions] = useState(true);

  const BLOCK_PALETTE: BlockPaletteItem[] = [
    { process: "perception" },
    { process: "learning" },
    { process: "reasoning" },
    { process: "planning" },
    { process: "execution" },
    { process: "interaction" },
  ];

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const handleDragStart = useCallback((event: React.DragEvent, item: BlockPaletteItem) => {
    const itemWithLabels = {
      ...item,
      label: t(`circuit.blocks.${item.process}.label`),
      description: t(`circuit.blocks.${item.process}.description`),
    };
    event.dataTransfer.setData("application/reactflow", JSON.stringify(itemWithLabels));
    event.dataTransfer.effectAllowed = "move";
  }, [t]);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const data = event.dataTransfer.getData("application/reactflow");
      if (!data) return;

      const item: { process: AgentProcess; label: string; description: string } = JSON.parse(data);
      const position = {
        x: event.clientX - 350,
        y: event.clientY - 200,
      };

      const newNode: Node = {
        id: `${item.process}-${Date.now()}`,
        type: "processNode",
        position,
        data: {
          id: `${item.process}-${Date.now()}`,
          process: item.process,
          label: item.label,
          description: item.description,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    []
  );

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
  };

  const handleSave = () => {
    onSave(nodes, edges);
  };

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(""), 1000);
  }, []);

  const addNodeFromPalette = useCallback(() => {
    const item = BLOCK_PALETTE[selectedPaletteIndex];
    if (!item) return;

    const position = { x: 100 + nodes.length * 50, y: 100 + nodes.length * 30 };
    const newNode: Node = {
      id: `${item.process}-${Date.now()}`,
      type: "processNode",
      position,
      data: {
        id: `${item.process}-${Date.now()}`,
        process: item.process,
        label: t(`circuit.blocks.${item.process}.label`),
        description: t(`circuit.blocks.${item.process}.description`),
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(newNode.id);
    announce(t("circuit.keyboard.nodeAdded", { process: item.process }));
  }, [selectedPaletteIndex, BLOCK_PALETTE, nodes.length, t, announce]);

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;
    
    setNodes((nds) => nds.filter(n => n.id !== selectedNodeId));
    setEdges((eds) => eds.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
    announce(t("circuit.keyboard.nodeRemoved"));
    setSelectedNodeId(null);
  }, [selectedNodeId, t, announce]);

  const moveSelectedNode = useCallback((dx: number, dy: number) => {
    if (!selectedNodeId) return;

    setNodes((nds) => nds.map(node => {
      if (node.id === selectedNodeId) {
        const newPosition = {
          x: node.position.x + dx,
          y: node.position.y + dy
        };
        announce(t("circuit.keyboard.nodeMoved", { x: Math.round(newPosition.x), y: Math.round(newPosition.y) }));
        return { ...node, position: newPosition };
      }
      return node;
    }));
  }, [selectedNodeId, t, announce]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && !e.shiftKey) {
        e.preventDefault();
        if (selectedNodeId) {
          moveSelectedNode(0, -20);
        } else {
          const newIndex = Math.max(selectedPaletteIndex - 1, 0);
          setSelectedPaletteIndex(newIndex);
          announce(t(`circuit.blocks.${BLOCK_PALETTE[newIndex].process}.label`));
        }
      } else if (e.key === "ArrowDown" && !e.shiftKey) {
        e.preventDefault();
        if (selectedNodeId) {
          moveSelectedNode(0, 20);
        } else {
          const newIndex = Math.min(selectedPaletteIndex + 1, BLOCK_PALETTE.length - 1);
          setSelectedPaletteIndex(newIndex);
          announce(t(`circuit.blocks.${BLOCK_PALETTE[newIndex].process}.label`));
        }
      } else if (e.key === "ArrowLeft" && selectedNodeId) {
        e.preventDefault();
        moveSelectedNode(-20, 0);
      } else if (e.key === "ArrowRight" && selectedNodeId) {
        e.preventDefault();
        moveSelectedNode(20, 0);
      } else if ((e.key === "Enter" || e.key === " ") && !selectedNodeId) {
        e.preventDefault();
        addNodeFromPalette();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelectedNode();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSelectedNodeId(null);
        announce(t("circuit.keyboard.selectionCleared"));
      } else if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        handleSave();
        announce(t("circuit.keyboard.circuitSaved"));
      } else if (e.key === "?") {
        e.preventDefault();
        setShowInstructions(!showInstructions);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeId, selectedPaletteIndex, showInstructions, BLOCK_PALETTE, moveSelectedNode, addNodeFromPalette, deleteSelectedNode, handleSave, announce, t]);

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {showInstructions && (
        <Card className="p-4 mb-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <Keyboard className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-2">{t("circuit.keyboard.title")}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div><kbd className="px-1 py-0.5 bg-background rounded border">↑↓</kbd> {t("circuit.keyboard.navigatePalette")}</div>
                <div><kbd className="px-1 py-0.5 bg-background rounded border">Enter</kbd> {t("circuit.keyboard.addNode")}</div>
                <div><kbd className="px-1 py-0.5 bg-background rounded border">←↑→↓</kbd> {t("circuit.keyboard.moveNode")}</div>
                <div><kbd className="px-1 py-0.5 bg-background rounded border">Del</kbd> {t("circuit.keyboard.removeNode")}</div>
                <div><kbd className="px-1 py-0.5 bg-background rounded border">Esc</kbd> {t("circuit.keyboard.clearSelection")}</div>
                <div><kbd className="px-1 py-0.5 bg-background rounded border">Ctrl+Enter</kbd> {t("circuit.keyboard.save")}</div>
                <div><kbd className="px-1 py-0.5 bg-background rounded border">?</kbd> {t("circuit.keyboard.toggleHelp")}</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setShowInstructions(false)}
              data-testid="button-hide-circuit-help"
            >
              ×
            </Button>
          </div>
        </Card>
      )}

    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-lg">{t("circuit.blockPalette")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("circuit.connectInstructions")}
        </p>
        <div className="space-y-2" role="listbox" aria-label={t("circuit.blockPalette")}>
          {BLOCK_PALETTE.map((item, index) => {
            const colors = getProcessColor(item.process);
            const Icon = PROCESS_ICONS[item.process];
            const isKeyboardSelected = !selectedNodeId && selectedPaletteIndex === index;
            return (
              <div
                key={item.process}
                role="option"
                aria-selected={isKeyboardSelected}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => setSelectedPaletteIndex(index)}
                className={cn(
                  "p-3 rounded-md border-2 cursor-move transition-all hover-elevate active-elevate-2",
                  colors.bg,
                  colors.text,
                  isKeyboardSelected && "ring-2 ring-primary"
                )}
                data-testid={`palette-block-${item.process}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">
                      {t(`circuit.blocks.${item.process}.label`)}
                    </div>
                    <div className="text-xs opacity-80">
                      {t(`circuit.blocks.${item.process}.description`)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="lg:col-span-3">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{t("circuit.canvasTitle")}</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClear}
                data-testid="button-clear-circuit"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t("circuit.clear")}
              </Button>
              <Button onClick={handleSave} data-testid="button-save-circuit">
                {t("circuit.saveCircuit")}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("circuit.connectInstructions")}
          </p>
          <div className="h-96 border-2 rounded-md">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={(changes) => {
                setNodes((nds) => {
                  const newNodes = [...nds];
                  changes.forEach((change) => {
                    if (change.type === "position" && change.position) {
                      const nodeIndex = newNodes.findIndex((n) => n.id === change.id);
                      if (nodeIndex !== -1) {
                        newNodes[nodeIndex] = {
                          ...newNodes[nodeIndex],
                          position: change.position,
                        };
                      }
                    } else if (change.type === "remove") {
                      return newNodes.filter((n) => n.id !== change.id);
                    }
                  });
                  return newNodes;
                });
              }}
              onEdgesChange={(changes) => {
                setEdges((eds) => {
                  let newEdges = [...eds];
                  changes.forEach((change) => {
                    if (change.type === "remove") {
                      newEdges = newEdges.filter((e) => e.id !== change.id);
                    }
                  });
                  return newEdges;
                });
              }}
              onConnect={onConnect}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </Card>
      </div>
    </div>
    </>
  );
}
