import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PhaseProgress, Phase } from "@/components/PhaseProgress";
import { useSession } from "@/hooks/useSession";
import { useConsent, safeLocalStorage } from "@/hooks/useConsent";
import { useClassification } from "@/hooks/useClassification";
import { useBoundaryMap } from "@/hooks/useBoundaryMap";
import { Primer } from "@/components/Primer";
import { WorkedExample } from "@/components/WorkedExample";
import { Phase1Guided } from "@/components/Phase1Guided";
import { ClassificationActivity } from "@/components/ClassificationActivity";
import { ConfidenceSlider } from "@/components/ConfidenceSlider";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { BoundaryMapCanvas } from "@/components/BoundaryMapCanvas";
import { FixedPipelineBuilder } from "@/components/FixedPipelineBuilder";
import { SimulationTracer } from "@/components/SimulationTracer";
import { FailureInjector } from "@/components/FailureInjector";
import { AssessmentDashboard } from "@/components/AssessmentDashboard";
import { GuidedCoachPanel } from "@/components/GuidedCoachPanel";
import { ConsentManager } from "@/components/ConsentManager";
import { HighContrastToggle } from "@/components/HighContrastToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MITOpenLearningLogo from "@assets/Open-Learning-logo-revised copy_1762811060793.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AgentProcess,
  ClassificationItem,
  ClassificationSubmission,
  BoundaryElement,
  BoundaryConnection,
  FailureMode,
  SimulationStep,
} from "@shared/schema";
import { ArrowRight, CheckCircle2, Play, Sparkles } from "lucide-react";
import { Block, Process, RuntimeCtx, Fixture, FailureConfig } from "@shared/runtime/types";
import { runPipeline, applyFailures, createInitialContext } from "@shared/runtime/engine";
import { cn } from "@/lib/utils";
import {
  PERCEPTION_BLOCKS,
  REASONING_BLOCKS,
  PLANNING_BLOCKS,
  EXECUTION_BLOCKS,
} from "@shared/scenarios/health-coach/blocks";
import fixturesData from "@shared/scenarios/health-coach/fixtures.json";

const FIXTURES: Fixture[] = fixturesData as Fixture[];

export default function LearningPage() {
  const { t } = useTranslation();
  const { hasConsent } = useConsent();
  const storage = safeLocalStorage(hasConsent);

  // Memoize classification items to prevent recreation on every render
  const CLASSIFICATION_ITEMS: ClassificationItem[] = useMemo(() => [
    { id: "feedback_loops", text: t("classificationItems.feedbackLoops"), correctProcess: "learning" },
    { id: "adaptation", text: t("classificationItems.adaptation"), correctProcess: "learning" },
    { id: "memory", text: t("classificationItems.memory"), correctProcess: "learning" },
    { id: "communication", text: t("classificationItems.communication"), correctProcess: "interaction" },
    { id: "api_integration", text: t("classificationItems.apiIntegration"), correctProcess: "interaction" },
    { id: "output_generation", text: t("classificationItems.outputGeneration"), correctProcess: "interaction" },
    { id: "input_processing", text: t("classificationItems.inputProcessing"), correctProcess: "perception" },
    { id: "context_understanding", text: t("classificationItems.contextUnderstanding"), correctProcess: "perception" },
    { id: "state_tracking", text: t("classificationItems.stateTracking"), correctProcess: "perception" },
    { id: "logical_interface", text: t("classificationItems.logicalInterface"), correctProcess: "reasoning" },
    { id: "knowledge_base", text: t("classificationItems.knowledgeBase"), correctProcess: "reasoning" },
    { id: "heuristics", text: t("classificationItems.heuristics"), correctProcess: "reasoning" },
    { id: "optimization", text: t("classificationItems.optimization"), correctProcess: "planning" },
    { id: "strategy", text: t("classificationItems.strategy"), correctProcess: "planning" },
    { id: "goal_setting", text: t("classificationItems.goalSetting"), correctProcess: "planning" },
    { id: "monitoring", text: t("classificationItems.monitoring"), correctProcess: "execution" },
    { id: "tool_usage", text: t("classificationItems.toolUsage"), correctProcess: "execution" },
    { id: "action_selection", text: t("classificationItems.actionSelection"), correctProcess: "execution" },
  ], [t]);
  
  const { sessionId, progress, isLoading: sessionLoading } = useSession();
  const classificationMutation = useClassification(sessionId || "");
  const boundaryMapMutation = useBoundaryMap(sessionId || "");
  
  // Phase 0: Primer (teach before practice) - persisted in localStorage
  const [primerComplete, setPrimerComplete] = useState(() => {
    const saved = storage.getItem("primerComplete");
    return saved === "true";
  });
  
  // Worked Example (model before practice) - persisted in localStorage
  const [workedExampleComplete, setWorkedExampleComplete] = useState(() => {
    const saved = storage.getItem("workedExampleComplete");
    return saved === "true";
  });
  
  // Guided Practice (2-bin practice) - persisted in localStorage
  const [guidedPracticeComplete, setGuidedPracticeComplete] = useState(() => {
    const saved = storage.getItem("guidedPracticeComplete");
    return saved === "true";
  });
  
  const [currentPhase, setCurrentPhase] = useState(() => {
    const savedPrimer = storage.getItem("primerComplete");
    const savedExample = storage.getItem("workedExampleComplete");
    const savedGuided = storage.getItem("guidedPracticeComplete");
    if (savedPrimer !== "true") return 0;
    if (savedExample !== "true") return 0.5;
    if (savedGuided !== "true") return 0.75; // Guided practice
    return 1; // Independent practice
  });

  const FAILURE_MODES: FailureMode[] = [
    {
      id: "noisy-input",
      name: t("failures.modes.noisyInput.name"),
      description: t("failures.modes.noisyInput.description"),
      enabled: false,
      affectedProcess: "perception",
    },
    {
      id: "missing-tool",
      name: t("failures.modes.missingTool.name"),
      description: t("failures.modes.missingTool.description"),
      enabled: false,
      affectedProcess: "execution",
    },
    {
      id: "stale-memory",
      name: t("failures.modes.staleMemory.name"),
      description: t("failures.modes.staleMemory.description"),
      enabled: false,
      affectedProcess: "reasoning",
    },
  ];
  const [phaseCompletion, setPhaseCompletion] = useState<Record<string, boolean>>({
    "1": false,
    "2": false,
    "3": false,
    "4": false,
    "5": false,
  });

  // Phase 1: Classification
  const [confidenceLevel, setConfidenceLevel] = useState(50);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [classifications, setClassifications] = useState<ClassificationSubmission[]>([]);

  // Phase 2: Boundary Mapping
  const [boundaryElements, setBoundaryElements] = useState<BoundaryElement[]>([]);
  const [boundaryConnections, setBoundaryConnections] = useState<BoundaryConnection[]>([]);
  const [boundaryMapFeedback, setBoundaryMapFeedback] = useState<string | null>(null);

  // Phase 3: Circuit Building  
  const [selectedBlocks, setSelectedBlocks] = useState<Record<Process, Block | null>>({
    perception: PERCEPTION_BLOCKS[1], // Smooth Wearables (better for beginners)
    reasoning: REASONING_BLOCKS[0],   // Threshold Check (simpler)
    planning: PLANNING_BLOCKS[0],     // Daily Planner
    execution: EXECUTION_BLOCKS[0],   // Send Notification
  });
  const [selectedFixture, setSelectedFixture] = useState<string>(FIXTURES[0].id);
  const [hasRunOnce, setHasRunOnce] = useState(false);

  // Phase 4: Simulation & Testing
  const [failureModes, setFailureModes] = useState<FailureMode[]>([]);
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([]);
  const [executionContext, setExecutionContext] = useState<RuntimeCtx | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runCount, setRunCount] = useState(0);

  const phases: Phase[] = [
    {
      id: 1,
      name: t("phases.phase1"),
      completed: phaseCompletion["1"],
      current: currentPhase === 1,
    },
    {
      id: 2,
      name: t("phases.phase2"),
      completed: phaseCompletion["2"],
      current: currentPhase === 2,
    },
    {
      id: 3,
      name: t("phases.phase3"),
      completed: phaseCompletion["3"],
      current: currentPhase === 3,
    },
    {
      id: 4,
      name: t("phases.phase4"),
      completed: phaseCompletion["4"],
      current: currentPhase === 4,
    },
    {
      id: 5,
      name: t("phases.phase5"),
      completed: phaseCompletion["5"],
      current: currentPhase === 5,
    },
  ];

  // Initialize failure modes with translations
  useEffect(() => {
    if (failureModes.length === 0) {
      setFailureModes(FAILURE_MODES);
    }
  }, [FAILURE_MODES, failureModes.length]);

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

    const feedback = {
      accuracy,
      explanationQuality,
      calibration,
      correctAnswers,
      feedback: submissions
        .filter((s) => !s.isCorrect)
        .map((s) => ({
          type: "incorrect" as const,
          title: t("classification.incorrectClassification"),
          message: t("classification.incorrectFeedback"),
          itemName: CLASSIFICATION_ITEMS.find((i) => i.id === s.itemId)?.text,
        })),
    };

    setFeedbackData(feedback);
    setShowFeedback(true);

    // Persist to server
    if (sessionId) {
      classificationMutation.mutate({
        submissions,
        confidence: confidenceLevel,
      });
    }
  };

  const handlePrimerComplete = () => {
    setPrimerComplete(true);
    storage.setItem("primerComplete", "true");
    setCurrentPhase(0.5); // Go to worked example
  };

  const handleWorkedExampleComplete = () => {
    setWorkedExampleComplete(true);
    storage.setItem("workedExampleComplete", "true");
    setCurrentPhase(0.75); // Go to guided practice
  };

  const handleGuidedPracticeComplete = () => {
    setGuidedPracticeComplete(true);
    storage.setItem("guidedPracticeComplete", "true");
    setCurrentPhase(1); // Go to independent practice
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
    setBoundaryElements(elements);
    setBoundaryConnections(connections);

    // Validation: Require minimum mapping effort
    const MIN_ELEMENTS = 3;
    const MIN_CONNECTIONS = 4; // At least one per core process
    
    if (elements.length < MIN_ELEMENTS) {
      setBoundaryMapFeedback(t("boundaryMap.feedback.needMoreElements", { count: MIN_ELEMENTS }));
      return;
    }

    if (connections.length < MIN_CONNECTIONS) {
      setBoundaryMapFeedback(t("boundaryMap.feedback.needMoreConnections", { count: MIN_CONNECTIONS }));
      return;
    }

    // Check if at least perception, reasoning, planning, and execution have connections
    const connectedProcesses = new Set(connections.map(c => c.process));
    const requiredProcesses: AgentProcess[] = ["perception", "reasoning", "planning", "execution"];
    const missingProcesses = requiredProcesses.filter(p => !connectedProcesses.has(p));

    if (missingProcesses.length > 0) {
      setBoundaryMapFeedback(
        t("boundaryMap.feedback.missingProcesses", { 
          processes: missingProcesses.join(", ") 
        })
      );
      return;
    }

    // New validation: Check for required element type → process connections (4+2 framework)
    // Sensor → Perception: Sensors provide input data that must be perceived
    const hasSensorToPerception = connections.some(conn => {
      const element = elements.find(e => e.id === conn.elementId);
      return element?.type === "sensor" && conn.process === "perception";
    });

    if (!hasSensorToPerception) {
      setBoundaryMapFeedback(t("boundaryMap.feedback.needSensorToPerception"));
      return;
    }

    // Execution → Tool/UI/API: Execution requires tools, APIs, or UI to interact with the world
    const hasExecutionToToolOrUI = connections.some(conn => {
      const element = elements.find(e => e.id === conn.elementId);
      return conn.process === "execution" && (element?.type === "ui" || element?.type === "log" || element?.type === "api");
    });

    if (!hasExecutionToToolOrUI) {
      setBoundaryMapFeedback(t("boundaryMap.feedback.needExecutionToTool"));
      return;
    }

    // All validation passed
    setBoundaryMapFeedback(null);
    
    // Persist to server
    if (sessionId) {
      boundaryMapMutation.mutate({
        elements,
        connections,
      });
    }
    
    handlePhaseComplete();
  };

  const handleBlockSelect = (process: Process, block: Block) => {
    setSelectedBlocks((prev) => ({ ...prev, [process]: block }));
  };

  const handleCircuitComplete = () => {
    handlePhaseComplete();
  };

  const handleSimulationRun = async () => {
    const pipeline = selectedBlocks as Record<Process, Block>;
    
    // Check if all blocks are selected
    const allSelected = Object.values(pipeline).every((block) => block !== null);
    if (!allSelected) {
      return;
    }

    setIsRunning(true);
    setSimulationSteps([]);

    try {
      // Get selected fixture
      const fixture = FIXTURES.find((f) => f.id === selectedFixture);
      if (!fixture) return;

      // Create initial context
      let ctx = createInitialContext(fixture.input);

      // Apply failures if any are enabled
      const activeFailures: FailureConfig = {
        noisyInput: failureModes.find((f) => f.id === "noisy-input")?.enabled,
        missingTool: failureModes.find((f) => f.id === "missing-tool")?.enabled ? "sendNotification" : undefined,
        staleMemory: failureModes.find((f) => f.id === "stale-memory")?.enabled,
      };

      ctx = applyFailures(ctx, activeFailures);

      // Run the pipeline
      const result = await runPipeline(pipeline, ctx);

      // Helper function to translate log entry data
      const translateLogData = (data: any) => {
        const translatedData = { ...data };
        
        // Translate action field if it's a translation key
        if (typeof data.action === 'string' && data.action.startsWith('healthCoach.')) {
          translatedData.action = t(data.action);
        }
        
        // Translate message field if it's a translation key
        if (typeof data.message === 'string' && data.message.startsWith('healthCoach.')) {
          translatedData.message = t(data.message);
        }
        
        // Translate error field if it's a translation key
        if (typeof data.error === 'string' && data.error.startsWith('healthCoach.')) {
          translatedData.error = t(data.error);
        }
        
        return translatedData;
      };

      // Convert runtime log to simulation steps
      const steps: SimulationStep[] = result.log.map((logEntry, index) => ({
        id: `step-${index}`,
        blockId: logEntry.step,
        timestamp: logEntry.timestamp,
        input: index > 0 ? result.log[index - 1]?.data : fixture.input,
        output: logEntry.data,
        status: logEntry.step.startsWith("ERROR") ? "error" : "success",
        message: JSON.stringify(translateLogData(logEntry.data), null, 2),
      }));

      setSimulationSteps(steps);
      setExecutionContext(result);
      setHasRunOnce(true);
      setRunCount((prev) => prev + 1);
    } finally {
      setIsRunning(false);
    }
  };

  const handleFailureToggle = (failureId: string, enabled: boolean) => {
    setFailureModes((prev) =>
      prev.map((f) => (f.id === failureId ? { ...f, enabled } : f))
    );
  };

  const pipelineComplete = Object.values(selectedBlocks).every((block) => block !== null);

  const assessmentMetrics = {
    classificationAccuracy: feedbackData?.accuracy || 0,
    explanationQuality: feedbackData?.explanationQuality || 0,
    boundaryMapCompleteness: phaseCompletion["2"] ? 85 : 0,
    circuitCorrectness: phaseCompletion["3"] ? 90 : 0,
    calibration: feedbackData?.calibration || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <HighContrastToggle />
      </div>
      {currentPhase > 0 && <PhaseProgress phases={phases} onPhaseClick={(id) => setCurrentPhase(id)} />}

      <div id="main-content" className="max-w-7xl mx-auto px-6 py-8">
        {currentPhase === 0 && (
          <Primer onComplete={handlePrimerComplete} />
        )}

        {currentPhase === 0.5 && (
          <WorkedExample onComplete={handleWorkedExampleComplete} />
        )}

        {currentPhase === 0.75 && (
          <Phase1Guided items={CLASSIFICATION_ITEMS} onComplete={handleGuidedPracticeComplete} />
        )}

        {currentPhase === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t("classification.title")}</h2>
              <p className="text-muted-foreground">
                {t("classification.independentDescription")}
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
                      <h3 className="font-semibold">{t("classification.phaseComplete")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("classification.continueDescription")}
                      </p>
                    </div>
                  </div>
                  <Button onClick={handlePhaseComplete} data-testid="button-next-phase">
                    {t("classification.continueToPhase2")}
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
              <h2 className="text-3xl font-bold mb-2">{t("boundaryMap.title")}</h2>
              <p className="text-muted-foreground">
                {t("boundaryMap.description")}
              </p>
            </div>

            <BoundaryMapCanvas 
              onSave={handleBoundaryMapSave}
              initialElements={boundaryElements}
              initialConnections={boundaryConnections}
            />

            {boundaryMapFeedback && (
              <Card className="p-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
                    !
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      {boundaryMapFeedback}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Complete the mapping requirements above to continue to Phase 3
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {currentPhase === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t("circuit.title")}</h2>
              <p className="text-muted-foreground">
                {t("circuit.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <FixedPipelineBuilder
                  perceptionBlocks={PERCEPTION_BLOCKS}
                  reasoningBlocks={REASONING_BLOCKS}
                  planningBlocks={PLANNING_BLOCKS}
                  executionBlocks={EXECUTION_BLOCKS}
                  selectedBlocks={selectedBlocks}
                  onBlockSelect={handleBlockSelect}
                />
              </div>

              <div>
                <GuidedCoachPanel
                  state="first-run"
                  hasRun={false}
                  pipelineComplete={pipelineComplete}
                  simulationSuccess={undefined}
                  failuresEnabled={false}
                  runCount={0}
                />
              </div>
            </div>

            {pipelineComplete && (
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-amber-600" />
                    <div>
                      <h3 className="font-semibold">{t("circuit.readyToTest")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("circuit.readyToTestDescription")}
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleCircuitComplete} data-testid="button-complete-circuit">
                    {t("circuit.testYourAgent")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {currentPhase === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t("simulation.title")}</h2>
              <p className="text-muted-foreground">
                {t("simulation.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-2 block">{t("simulation.testScenario")}</label>
                      <Select value={selectedFixture} onValueChange={setSelectedFixture}>
                        <SelectTrigger data-testid="fixture-selector">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIXTURES.map((fixture) => (
                            <SelectItem key={fixture.id} value={fixture.id}>
                              {fixture.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {FIXTURES.find(f => f.id === selectedFixture)?.description}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={handleSimulationRun}
                      disabled={!pipelineComplete || isRunning}
                      data-testid="button-run-simulation"
                      className="mt-6"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {hasRunOnce ? t("simulation.runAgain") : t("simulation.runDemo")}
                    </Button>
                  </div>

                  {executionContext && (
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="p-3 rounded-md bg-muted/50">
                        <div className="text-xs text-muted-foreground mb-1">{t("simulation.metrics.result")}</div>
                        <div className={cn(
                          "text-base font-semibold",
                          executionContext.success ? "text-green-600" : "text-red-600"
                        )}>
                          {executionContext.success ? t("simulation.metrics.success") : t("simulation.metrics.failed")}
                        </div>
                      </div>
                      <div className="p-3 rounded-md bg-muted/50">
                        <div className="text-xs text-muted-foreground mb-1">{t("simulation.metrics.steps")}</div>
                        <div className="text-base font-semibold">
                          {Math.floor(simulationSteps.length / 2)}
                        </div>
                      </div>
                      <div className="p-3 rounded-md bg-muted/50">
                        <div className="text-xs text-muted-foreground mb-1">{t("simulation.metrics.toolCalls")}</div>
                        <div className="text-base font-semibold">
                          {executionContext.log.filter((l) => l.step.includes("EXECUTION")).length}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                <SimulationTracer
                  steps={simulationSteps}
                  selectedBlocks={selectedBlocks}
                  onRun={handleSimulationRun}
                  onReset={() => {
                    setSimulationSteps([]);
                    setExecutionContext(null);
                    setHasRunOnce(false);
                  }}
                  isRunning={isRunning}
                />

                <FailureInjector failures={failureModes} onToggle={handleFailureToggle} />
              </div>

              <div>
                <GuidedCoachPanel
                  state={hasRunOnce ? "success-experiment" : "first-run"}
                  hasRun={hasRunOnce}
                  pipelineComplete={pipelineComplete}
                  simulationSuccess={executionContext?.success}
                  failuresEnabled={failureModes.some(f => f.enabled)}
                  runCount={runCount}
                />
              </div>
            </div>

            <Card className="p-6">
              <Button onClick={handlePhaseComplete} data-testid="button-complete-simulation">
                {t("simulation.completePhase")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>
        )}

        {currentPhase === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t("assessment.title")}</h2>
              <p className="text-muted-foreground">
                {t("assessment.description")}
              </p>
            </div>

            <AssessmentDashboard metrics={assessmentMetrics} phaseCompletion={phaseCompletion} />
          </div>
        )}

        <div className="mt-12 mb-6 flex justify-center">
          <img src={MITOpenLearningLogo} alt="MIT Open Learning" className="h-12 opacity-80" />
        </div>
      </div>

      <FeedbackPanel
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        accuracy={feedbackData?.accuracy || 0}
        explanationQuality={feedbackData?.explanationQuality || 0}
        calibration={feedbackData?.calibration || 0}
        feedback={feedbackData?.feedback || []}
      />
      
      <div className="fixed bottom-4 right-4">
        <ConsentManager />
      </div>
    </div>
  );
}
