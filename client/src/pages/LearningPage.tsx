import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { PhaseProgress, Phase } from "@/components/PhaseProgress";
import { useSession } from "@/hooks/useSession";
import { useConsent, safeLocalStorage } from "@/hooks/useConsent";
import { useClassification } from "@/hooks/useClassification";
import { useBoundaryMap } from "@/hooks/useBoundaryMap";
import { Primer } from "@/components/Primer";
import { WorkedExample } from "@/components/WorkedExample";
import { Phase1Guided } from "@/components/Phase1Guided";
import { ClassificationActivity } from "@/components/ClassificationActivity";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { BoundaryMapCanvas } from "@/components/BoundaryMapCanvas";
import { FixedPipelineBuilder } from "@/components/FixedPipelineBuilder";
import { SimulationTracer } from "@/components/SimulationTracer";
import { FailureInjector } from "@/components/FailureInjector";
import { AssessmentDashboard } from "@/components/AssessmentDashboard";
import { GuidedCoachPanel } from "@/components/GuidedCoachPanel";
import { ConsentManager } from "@/components/ConsentManager";
import { HighContrastToggle } from "@/components/HighContrastToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
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
import { ArrowRight, ArrowLeft, CheckCircle2, Play, Sparkles, Home, Box, MapPin, Lightbulb } from "lucide-react";
import { Block, Process, RuntimeCtx, Fixture, FailureConfig } from "@shared/runtime/types";
import { runPipeline, applyFailures, createInitialContext } from "@shared/runtime/engine";
import { cn } from "@/lib/utils";
import {
  PERCEPTION_BLOCKS,
  REASONING_BLOCKS,
  PLANNING_BLOCKS,
  EXECUTION_BLOCKS,
} from "@shared/scenarios/health-coach/blocks";
import { CLASSIFICATION_ITEMS_DATA } from "@shared/classificationData";
import { 
  LearningStage, 
  isPrePhase, 
  isMainPhase,
  isBridgeStage,
  getNextStage,
  getPreviousStage,
} from "@shared/learningTypes";
import { CircuitBridge } from "@/components/CircuitBridge";
import { MemoryConnectionsPractice } from "@/components/MemoryConnectionsPractice";
import fixturesData from "@shared/scenarios/health-coach/fixtures.json";

const FIXTURES: Fixture[] = fixturesData as Fixture[];

// Phase Navigation Component with semantic HTML and ARIA support
function PhaseNavigation({ 
  onPrevious, 
  onNext, 
  showPrevious = true, 
  showNext = true,
  nextLabel,
  previousLabel 
}: { 
  onPrevious?: () => void; 
  onNext?: () => void; 
  showPrevious?: boolean; 
  showNext?: boolean;
  nextLabel?: string;
  previousLabel?: string;
}) {
  const { t } = useTranslation();
  
  return (
    <nav aria-label={t("navigation.phaseNavigation")} className="mt-6">
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          {showPrevious && onPrevious ? (
            <Button
              variant="outline"
              onClick={onPrevious}
              data-testid="button-previous-phase"
              aria-label={previousLabel || t("navigation.previousPhase")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
              {previousLabel || t("navigation.previousPhase")}
            </Button>
          ) : (
            <div />
          )}
          {showNext && onNext ? (
            <Button
              onClick={onNext}
              data-testid="button-next-phase-bottom"
              aria-label={nextLabel || t("navigation.nextPhase")}
            >
              {nextLabel || t("navigation.nextPhase")}
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </Card>
    </nav>
  );
}

export default function LearningPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { hasConsent } = useConsent();
  const storage = safeLocalStorage(hasConsent);

  // Build classification items from shared data with translated text
  const CLASSIFICATION_ITEMS: ClassificationItem[] = useMemo(() => 
    CLASSIFICATION_ITEMS_DATA.map(item => ({
      id: item.id,
      text: t(`classificationItems.${item.feedbackKey}`),
      correctProcess: item.correctProcess,
    })),
  [t]);
  
  const { sessionId, progress, isLoading: sessionLoading } = useSession();
  const classificationMutation = useClassification(sessionId);
  const boundaryMapMutation = useBoundaryMap(sessionId);
  
  // Current learning stage - either a pre-phase stage, bridge stage, or main phase number
  // Persist both pre-phase/bridge completion and current stage for full state restoration
  const [currentStage, setCurrentStage] = useState<LearningStage>(() => {
    // First check if there's a saved current stage
    const savedStage = storage.getItem("currentStage");
    if (savedStage) {
      // Parse the saved stage (could be a string or number)
      const parsed = parseInt(savedStage, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
        return parsed as LearningStage;
      }
      // Check if it's a valid pre-phase stage string
      if (savedStage === 'primer' || savedStage === 'workedExample' || savedStage === 'guidedPractice') {
        return savedStage;
      }
      // Check if it's a valid bridge stage string
      if (savedStage === 'circuitBridge' || savedStage === 'memoryConnectionsPractice') {
        return savedStage;
      }
    }
    
    // Fallback: Determine starting stage based on completion state
    const savedPrimer = storage.getItem("primerComplete");
    const savedExample = storage.getItem("workedExampleComplete");
    const savedGuided = storage.getItem("guidedPracticeComplete");
    
    if (savedPrimer !== "true") return 'primer';
    if (savedExample !== "true") return 'workedExample';
    if (savedGuided !== "true") return 'guidedPractice';
    return 1;
  });

  // Persist stage changes to localStorage
  useEffect(() => {
    storage.setItem("currentStage", String(currentStage));
  }, [currentStage, storage]);

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
  // Phase and bridge stage completion state - persisted to localStorage
  const [phaseCompletion, setPhaseCompletion] = useState<Record<string, boolean>>(() => ({
    "1": storage.getItem("phase1Complete") === "true",
    "2": storage.getItem("phase2Complete") === "true",
    "circuitBridge": storage.getItem("circuitBridgeComplete") === "true",
    "memoryConnectionsPractice": storage.getItem("memoryConnectionsPracticeComplete") === "true",
    "3": storage.getItem("phase3Complete") === "true",
    "4": storage.getItem("phase4Complete") === "true",
    "5": storage.getItem("phase5Complete") === "true",
  }));

  // Check if bridge stages are complete (needed for Phase 3 accessibility)
  const bridgeStagesComplete = phaseCompletion["circuitBridge"] && phaseCompletion["memoryConnectionsPractice"];

  // Persist phase completion to localStorage
  useEffect(() => {
    Object.entries(phaseCompletion).forEach(([key, completed]) => {
      if (completed) {
        // Handle both numeric phases and string bridge stages
        if (/^\d+$/.test(key)) {
          storage.setItem(`phase${key}Complete`, "true");
        } else {
          storage.setItem(`${key}Complete`, "true");
        }
      }
    });
  }, [phaseCompletion, storage]);

  // Phase 1: Classification
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
      current: currentStage === 1,
    },
    {
      id: 2,
      name: t("phases.phase2"),
      // Phase 2 checkmark: boundary map validated
      // Connector to Phase 3: requires bridge stages complete
      completed: phaseCompletion["2"],
      canProceed: bridgeStagesComplete,
      current: currentStage === 2 || isBridgeStage(currentStage),
    },
    {
      id: 3,
      name: t("phases.phase3"),
      completed: phaseCompletion["3"],
      current: currentStage === 3,
    },
    {
      id: 4,
      name: t("phases.phase4"),
      completed: phaseCompletion["4"],
      current: currentStage === 4,
    },
    {
      id: 5,
      name: t("phases.phase5"),
      completed: phaseCompletion["5"],
      current: currentStage === 5,
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

    const feedback = {
      accuracy,
      correctAnswers,
      feedback: [],
    };

    setFeedbackData(feedback);
    setShowFeedback(true);

    // Persist to server
    if (sessionId) {
      classificationMutation.mutate({
        submissions,
      });
    }
  };

  const handlePrimerComplete = () => {
    storage.setItem("primerComplete", "true");
    setCurrentStage('workedExample');
  };

  const handleWorkedExampleComplete = () => {
    storage.setItem("workedExampleComplete", "true");
    setCurrentStage('guidedPractice');
  };

  const handleGuidedPracticeComplete = () => {
    storage.setItem("guidedPracticeComplete", "true");
    setCurrentStage(1);
  };

  // Mark a phase/stage as complete without advancing (for re-saves, replays, etc.)
  const markPhaseComplete = (stage: LearningStage) => {
    if (isMainPhase(stage) || isBridgeStage(stage)) {
      const key = String(stage);
      setPhaseCompletion((prev) => ({ ...prev, [key]: true }));
      // Immediately persist to localStorage (useEffect is async)
      if (/^\d+$/.test(key)) {
        storage.setItem(`phase${key}Complete`, "true");
      } else {
        storage.setItem(`${key}Complete`, "true");
      }
    }
  };

  // Handle explicit "Continue to next phase" action - marks complete AND advances
  const handlePhaseComplete = () => {
    if (isMainPhase(currentStage) || isBridgeStage(currentStage)) {
      markPhaseComplete(currentStage);
      const nextStage = getNextStage(currentStage);
      if (nextStage) {
        setCurrentStage(nextStage);
      }
    }
    setShowFeedback(false);
  };

  // Navigate to previous stage using the type-safe helper
  const navigateToPreviousStage = () => {
    const prevStage = getPreviousStage(currentStage);
    if (prevStage) {
      setCurrentStage(prevStage);
    }
  };

  // Navigate to next stage - handles pre-phase completion, bridge stages, and main phase progression
  const navigateToNextStage = () => {
    if (currentStage === 'primer') {
      handlePrimerComplete();
    } else if (currentStage === 'workedExample') {
      handleWorkedExampleComplete();
    } else if (currentStage === 'guidedPractice') {
      handleGuidedPracticeComplete();
    } else if (isBridgeStage(currentStage)) {
      handlePhaseComplete();
    } else if (isMainPhase(currentStage) && currentStage < 5) {
      handlePhaseComplete();
    }
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
    
    // Mark phase 2 as complete, but only auto-advance if not already completed
    // This allows users to revisit and re-save without being forced to advance
    if (!phaseCompletion["2"]) {
      handlePhaseComplete();
    } else {
      markPhaseComplete(2);
    }
  };

  const handleBlockSelect = (process: Process, block: Block) => {
    setSelectedBlocks((prev) => ({ ...prev, [process]: block }));
  };

  const handleCircuitComplete = () => {
    // Only auto-advance if phase 3 is not already completed
    if (!phaseCompletion["3"]) {
      handlePhaseComplete();
    } else {
      markPhaseComplete(3);
    }
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
      <div className="fixed top-3 sm:top-4 left-3 sm:left-4 z-50">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setLocation("/")}
          data-testid="button-back-home"
          className="min-h-[44px] sm:min-h-[36px]"
        >
          <Home className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">{t("navigation.backToHome")}</span>
        </Button>
      </div>
      <div className="fixed top-3 sm:top-4 right-3 sm:right-4 z-50 flex gap-2">
        <LanguageSelector />
        <HighContrastToggle />
      </div>
      {isMainPhase(currentStage) && <PhaseProgress phases={phases} onPhaseClick={(id) => {
        // Gate Phase 3: requires bridge stages complete
        if (id === 3 && !bridgeStagesComplete) {
          return; // Silently ignore - UI should show connector as incomplete
        }
        setCurrentStage(id as LearningStage);
      }} />}

      <div id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentStage === 'primer' && (
          <Primer onComplete={handlePrimerComplete} />
        )}

        {currentStage === 'workedExample' && (
          <WorkedExample 
            onComplete={handleWorkedExampleComplete} 
            onBack={navigateToPreviousStage}
          />
        )}

        {currentStage === 'guidedPractice' && (
          <Phase1Guided 
            items={CLASSIFICATION_ITEMS} 
            onComplete={handleGuidedPracticeComplete}
            onBack={navigateToPreviousStage}
          />
        )}

        {currentStage === 'circuitBridge' && (
          <CircuitBridge
            onComplete={() => {
              markPhaseComplete('circuitBridge');
              setCurrentStage('memoryConnectionsPractice');
            }}
            onBack={navigateToPreviousStage}
            isAlreadyComplete={phaseCompletion['circuitBridge']}
          />
        )}

        {currentStage === 'memoryConnectionsPractice' && (
          <MemoryConnectionsPractice
            onComplete={() => {
              markPhaseComplete('memoryConnectionsPractice');
              setCurrentStage(3);
            }}
            onBack={navigateToPreviousStage}
            isAlreadyComplete={phaseCompletion['memoryConnectionsPractice']}
          />
        )}

        {currentStage === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{t("classification.title")}</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {t("classification.independentDescription")}
              </p>
            </div>

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

            {!showFeedback && (
              <PhaseNavigation
                onPrevious={navigateToPreviousStage}
                showNext={false}
              />
            )}
          </div>
        )}

        {currentStage === 2 && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {t("boundaryMap.title")}
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-3xl">
                {t("boundaryMap.description")}
              </p>
            </div>

            {/* Section 1: Understanding Agent Boundaries */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-primary" aria-hidden="true" />
                <h3 className="text-xl sm:text-2xl font-bold">
                  {t("boundaryMap.sectionTitle1")}
                </h3>
              </div>
              
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left sub-card: Core concept */}
                <Card className="p-6 space-y-3" data-testid="card-boundaries-overview">
                  <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                    <p dangerouslySetInnerHTML={{ __html: t("boundaryMap.intro1_p1") }} />
                    <p dangerouslySetInnerHTML={{ __html: t("boundaryMap.intro1_p2") }} />
                    <p dangerouslySetInnerHTML={{ __html: t("boundaryMap.intro1_p4") }} />
                  </div>
                </Card>

                {/* Right sub-card: Visual capability list */}
                <Card className="p-6 space-y-4" data-testid="list-agent-capabilities">
                  <h4 className="font-semibold text-base">
                    {t("boundaryMap.capabilitiesTitle")}
                  </h4>
                  <ul className="space-y-3" aria-label={t("accessibility.lists.agentCapabilities")}>
                    <li className="flex items-start gap-3 p-3 rounded-md border-2 border-green-500/30 bg-green-50 dark:bg-green-950/20">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-green-900 dark:text-green-100">
                          {t("boundaryMap.capability1Title")}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                          {t("boundaryMap.capability1Description")}
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-md border-2 border-purple-500/30 bg-purple-50 dark:bg-purple-950/20">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-purple-900 dark:text-purple-100">
                          {t("boundaryMap.capability2Title")}
                        </p>
                        <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                          {t("boundaryMap.capability2Description")}
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-md border-2 border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/20">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-cyan-900 dark:text-cyan-100">
                          {t("boundaryMap.capability3Title")}
                        </p>
                        <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-0.5">
                          {t("boundaryMap.capability3Description")}
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-3 rounded-md border-2 border-orange-500/30 bg-orange-50 dark:bg-orange-950/20">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                        4
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-orange-900 dark:text-orange-100">
                          {t("boundaryMap.capability4Title")}
                        </p>
                        <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
                          {t("boundaryMap.capability4Description")}
                        </p>
                      </div>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>

            {/* Section 2: Your Task */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
                <h3 className="text-xl sm:text-2xl font-bold">
                  {t("boundaryMap.sectionTitle2")}
                </h3>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left sub-card: Activity description */}
                <Card className="p-6 space-y-3" data-testid="card-task-overview">
                  <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                    <p className="text-center" dangerouslySetInnerHTML={{ __html: t("boundaryMap.intro2_p1") }} />
                    <p dangerouslySetInnerHTML={{ __html: t("boundaryMap.intro2_p2") }} />
                    <p dangerouslySetInnerHTML={{ __html: t("boundaryMap.intro2_p4") }} />
                  </div>
                </Card>

                {/* Right sub-card: Three key questions */}
                <Card className="p-6 space-y-4 relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent" data-testid="list-key-questions">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" aria-hidden="true" />
                    <h4 className="font-semibold text-base text-primary">
                      {t("boundaryMap.sectionTitle3")}
                    </h4>
                  </div>
                  <ol className="space-y-3" aria-label={t("accessibility.lists.keyQuestions")}>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden="true" />
                      </div>
                      <p className="flex-1 text-sm font-medium leading-relaxed">
                        {t("boundaryMap.question1")}
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden="true" />
                      </div>
                      <p className="flex-1 text-sm font-medium leading-relaxed">
                        {t("boundaryMap.question2")}
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden="true" />
                      </div>
                      <p className="flex-1 text-sm font-medium leading-relaxed">
                        {t("boundaryMap.question3")}
                      </p>
                    </li>
                  </ol>
                </Card>
              </div>
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
                      {t("boundaryMap.completeRequirements")}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <PhaseNavigation
              onPrevious={navigateToPreviousStage}
              onNext={!boundaryMapFeedback ? navigateToNextStage : undefined}
              showNext={!boundaryMapFeedback}
            />
          </div>
        )}

        {currentStage === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{t("circuit.title")}</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
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

            <PhaseNavigation
              onPrevious={navigateToPreviousStage}
              onNext={pipelineComplete ? navigateToNextStage : undefined}
              showNext={pipelineComplete}
            />
          </div>
        )}

        {currentStage === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{t("simulation.title")}</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
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

            <PhaseNavigation
              onPrevious={navigateToPreviousStage}
              onNext={navigateToNextStage}
            />
          </div>
        )}

        {currentStage === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{t("assessment.title")}</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {t("assessment.description")}
              </p>
            </div>

            <AssessmentDashboard metrics={assessmentMetrics} phaseCompletion={phaseCompletion} />

            <PhaseNavigation
              onPrevious={navigateToPreviousStage}
              onNext={() => setLocation("/")}
              nextLabel={t("navigation.backToHome")}
              showNext={true}
            />
          </div>
        )}

        <footer className="mt-16 pt-6 border-t border-border/40 mb-6 relative">
          <div className="flex flex-col items-center gap-4">
            <img src={MITOpenLearningLogo} alt={t("accessibility.images.mitOpenLearning")} className="h-10 opacity-80" />
            <div className="flex items-center gap-3">
              <a 
                href="https://accessibility.mit.edu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
                data-testid="link-accessibility"
              >
                {t("footer.accessibilityLink")}
              </a>
              <span className="text-muted-foreground/30">|</span>
              <ConsentManager />
            </div>
          </div>
          
          <p className="absolute bottom-0 right-0 text-[10px] text-muted-foreground/60 text-right leading-tight">
            {t("footer.copyright")} {t("footer.orgName")}<br />
            {t("footer.institution")}, {t("footer.location")}
          </p>
        </footer>
      </div>

      {currentStage !== 1 && currentStage !== 'guidedPractice' && (
        <FeedbackPanel
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          accuracy={feedbackData?.accuracy || 0}
          feedback={feedbackData?.feedback || []}
        />
      )}
    </div>
  );
}
