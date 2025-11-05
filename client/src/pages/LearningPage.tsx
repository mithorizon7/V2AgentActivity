import { useState } from "react";
import { PhaseProgress, Phase } from "@/components/PhaseProgress";
import { ClassificationActivity } from "@/components/ClassificationActivity";
import { ConfidenceSlider } from "@/components/ConfidenceSlider";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { BoundaryMapCanvas } from "@/components/BoundaryMapCanvas";
import { CircuitBuilder } from "@/components/CircuitBuilder";
import { SimulationTracer } from "@/components/SimulationTracer";
import { FailureInjector } from "@/components/FailureInjector";
import { AssessmentDashboard } from "@/components/AssessmentDashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ClassificationItem,
  ClassificationSubmission,
  BoundaryElement,
  BoundaryConnection,
  FailureMode,
  SimulationStep,
} from "@shared/schema";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const CLASSIFICATION_ITEMS: ClassificationItem[] = [
  { id: "feedback_loops", text: "Feedback Loops", correctProcess: "learning" },
  { id: "adaptation", text: "Adaptation", correctProcess: "learning" },
  { id: "memory", text: "Memory", correctProcess: "learning" },
  { id: "communication", text: "Communication", correctProcess: "interaction" },
  { id: "api_integration", text: "API Integration", correctProcess: "interaction" },
  { id: "output_generation", text: "Output Generation", correctProcess: "interaction" },
  { id: "input_processing", text: "Input Processing", correctProcess: "perception" },
  { id: "context_understanding", text: "Context Understanding", correctProcess: "perception" },
  { id: "state_tracking", text: "State Tracking", correctProcess: "perception" },
  { id: "logical_interface", text: "Logical Interface", correctProcess: "reasoning" },
  { id: "knowledge_base", text: "Knowledge Base", correctProcess: "reasoning" },
  { id: "heuristics", text: "Heuristics", correctProcess: "reasoning" },
  { id: "optimization", text: "Optimization", correctProcess: "planning" },
  { id: "strategy", text: "Strategy", correctProcess: "planning" },
  { id: "goal_setting", text: "Goal Setting", correctProcess: "planning" },
  { id: "monitoring", text: "Monitoring", correctProcess: "execution" },
  { id: "tool_usage", text: "Tool Usage", correctProcess: "execution" },
  { id: "action_selection", text: "Action Selection", correctProcess: "execution" },
];

const FAILURE_MODES: FailureMode[] = [
  {
    id: "memory-blank",
    name: "Blank Memory",
    description: "Agent has no stored context or previous interactions",
    enabled: false,
    affectedProcess: "learning",
  },
  {
    id: "tool-wrong",
    name: "Wrong Tool Handle",
    description: "Agent attempts to use unavailable or incorrect tools",
    enabled: false,
    affectedProcess: "execution",
  },
  {
    id: "perception-noisy",
    name: "Noisy Sensor Data",
    description: "Input data contains errors or inconsistencies",
    enabled: false,
    affectedProcess: "perception",
  },
  {
    id: "reasoning-incomplete",
    name: "Incomplete Knowledge Base",
    description: "Missing critical information for decision-making",
    enabled: false,
    affectedProcess: "reasoning",
  },
];

export default function LearningPage() {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [phaseCompletion, setPhaseCompletion] = useState<Record<string, boolean>>({
    "1": false,
    "2": false,
    "3": false,
    "4": false,
    "5": false,
  });

  const [confidenceLevel, setConfidenceLevel] = useState(50);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [classifications, setClassifications] = useState<ClassificationSubmission[]>([]);
  const [failureModes, setFailureModes] = useState<FailureMode[]>(FAILURE_MODES);
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([]);

  const phases: Phase[] = [
    {
      id: 1,
      name: "Classification & Explanation",
      completed: phaseCompletion["1"],
      current: currentPhase === 1,
    },
    {
      id: 2,
      name: "Boundary Mapping",
      completed: phaseCompletion["2"],
      current: currentPhase === 2,
    },
    {
      id: 3,
      name: "Circuit Building",
      completed: phaseCompletion["3"],
      current: currentPhase === 3,
    },
    {
      id: 4,
      name: "Simulation & Testing",
      completed: phaseCompletion["4"],
      current: currentPhase === 4,
    },
    {
      id: 5,
      name: "Assessment & Review",
      completed: phaseCompletion["5"],
      current: currentPhase === 5,
    },
  ];

  const handleClassificationSubmit = (submissions: ClassificationSubmission[]) => {
    setClassifications(submissions);
    const accuracy = (submissions.filter((s) => s.isCorrect).length / submissions.length) * 100;
    const correctAnswers: Record<string, boolean> = {};
    submissions.forEach((s) => {
      correctAnswers[s.itemId] = s.isCorrect;
    });

    const explanationQuality = submissions.reduce((acc, s) => {
      const wordCount = s.explanation.split(/\s+/).length;
      return acc + Math.min((wordCount / 15) * 100, 100);
    }, 0) / submissions.length;

    const calibrationError = Math.abs(accuracy - confidenceLevel);
    const calibration = Math.max(0, 100 - calibrationError);

    setFeedbackData({
      accuracy,
      explanationQuality,
      calibration,
      correctAnswers,
      feedback: submissions
        .filter((s) => !s.isCorrect)
        .map((s) => ({
          type: "incorrect" as const,
          title: "Incorrect Classification",
          message: `Consider how this relates to the core function of the correct process`,
          itemName: CLASSIFICATION_ITEMS.find((i) => i.id === s.itemId)?.text,
        })),
    });

    setShowFeedback(true);
  };

  const handlePhaseComplete = () => {
    setPhaseCompletion((prev) => ({ ...prev, [currentPhase]: true }));
    if (currentPhase < 5) {
      setCurrentPhase(currentPhase + 1);
    }
    setShowFeedback(false);
  };

  const handleBoundaryMapSave = (
    elements: BoundaryElement[],
    connections: BoundaryConnection[]
  ) => {
    handlePhaseComplete();
  };

  const handleCircuitSave = (nodes: any[], edges: any[]) => {
    handlePhaseComplete();
  };

  const handleSimulationRun = () => {
    const mockSteps: SimulationStep[] = [
      {
        id: "step-1",
        blockId: "perception-input",
        timestamp: Date.now(),
        input: { sensorData: "temperature: 98.6°F" },
        output: { structured: { temp: 98.6, unit: "F" } },
        status: "success",
        message: "Successfully processed sensor input",
      },
      {
        id: "step-2",
        blockId: "reasoning-logic",
        timestamp: Date.now() + 1000,
        input: { temp: 98.6, unit: "F" },
        output: { assessment: "normal" },
        status: "success",
        message: "Temperature within normal range",
      },
      {
        id: "step-3",
        blockId: "planning-strategy",
        timestamp: Date.now() + 2000,
        input: { assessment: "normal" },
        output: { action: "monitor" },
        status: "success",
        message: "Planned monitoring action",
      },
    ];
    setSimulationSteps(mockSteps);
  };

  const handleFailureToggle = (failureId: string, enabled: boolean) => {
    setFailureModes((prev) =>
      prev.map((f) => (f.id === failureId ? { ...f, enabled } : f))
    );
  };

  const assessmentMetrics = {
    classificationAccuracy: feedbackData?.accuracy || 0,
    explanationQuality: feedbackData?.explanationQuality || 0,
    boundaryMapCompleteness: phaseCompletion["2"] ? 85 : 0,
    circuitCorrectness: phaseCompletion["3"] ? 80 : 0,
    calibration: feedbackData?.calibration || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <PhaseProgress phases={phases} onPhaseClick={(id) => setCurrentPhase(id)} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentPhase === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Phase 1: Classification & Explanation</h2>
              <p className="text-muted-foreground">
                Classify agent capabilities into the six core processes and explain your reasoning
              </p>
            </div>

            <ConfidenceSlider
              value={confidenceLevel}
              onChange={setConfidenceLevel}
              disabled={showFeedback}
            />

            <ClassificationActivity
              items={CLASSIFICATION_ITEMS}
              onSubmit={handleClassificationSubmit}
              showFeedback={showFeedback}
              correctAnswers={feedbackData?.correctAnswers}
            />

            {showFeedback && (
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold">Phase Complete!</h3>
                      <p className="text-sm text-muted-foreground">
                        Review your feedback and continue to the next phase
                      </p>
                    </div>
                  </div>
                  <Button onClick={handlePhaseComplete} data-testid="button-next-phase">
                    Continue to Phase 2
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {currentPhase === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Phase 2: Boundary Mapping</h2>
              <p className="text-muted-foreground">
                Map the agent's environment, tools, and data flows to understand system boundaries
              </p>
            </div>

            <BoundaryMapCanvas onSave={handleBoundaryMapSave} />
          </div>
        )}

        {currentPhase === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Phase 3: Circuit Building</h2>
              <p className="text-muted-foreground">
                Assemble agent blocks to create a functional workflow
              </p>
            </div>

            <CircuitBuilder onSave={handleCircuitSave} />
          </div>
        )}

        {currentPhase === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Phase 4: Simulation & Testing</h2>
              <p className="text-muted-foreground">
                Run your agent, observe execution traces, and inject failures to test resilience
              </p>
            </div>

            <SimulationTracer
              steps={simulationSteps}
              onRun={handleSimulationRun}
              onReset={() => setSimulationSteps([])}
              isRunning={simulationSteps.length > 0}
            />

            <FailureInjector failures={failureModes} onToggle={handleFailureToggle} />

            <Card className="p-6">
              <Button onClick={handlePhaseComplete} data-testid="button-complete-simulation">
                Complete Phase 4
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>
        )}

        {currentPhase === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Phase 5: Assessment & Review</h2>
              <p className="text-muted-foreground">
                Review your performance across all phases and identify areas for growth
              </p>
            </div>

            <AssessmentDashboard metrics={assessmentMetrics} phaseCompletion={phaseCompletion} />
          </div>
        )}
      </div>

      <FeedbackPanel
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        accuracy={feedbackData?.accuracy || 0}
        explanationQuality={feedbackData?.explanationQuality || 0}
        calibration={feedbackData?.calibration || 0}
        feedback={feedbackData?.feedback || []}
      />
    </div>
  );
}
