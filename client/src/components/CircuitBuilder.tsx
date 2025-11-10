import { useState, useCallback } from "react";
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-lg">{t("circuit.blockPalette")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("circuit.connectInstructions")}
        </p>
        <div className="space-y-2">
          {BLOCK_PALETTE.map((item) => {
            const colors = getProcessColor(item.process);
            const Icon = PROCESS_ICONS[item.process];
            return (
              <div
                key={item.process}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                className={cn(
                  "p-3 rounded-md border-2 cursor-move transition-all hover-elevate active-elevate-2",
                  colors.bg,
                  colors.text
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
  );
}
