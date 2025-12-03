export type PrePhaseStage = 'primer' | 'workedExample' | 'guidedPractice';
export type BridgeStage = 'circuitBridge' | 'memoryConnectionsPractice';
export type MainPhase = 1 | 2 | 3 | 4 | 5;
export type LearningStage = PrePhaseStage | BridgeStage | MainPhase;

export const PRE_PHASE_ORDER: PrePhaseStage[] = ['primer', 'workedExample', 'guidedPractice'];
export const BRIDGE_STAGES: BridgeStage[] = ['circuitBridge', 'memoryConnectionsPractice'];

export function isBridgeStage(stage: LearningStage): stage is BridgeStage {
  return stage === 'circuitBridge' || stage === 'memoryConnectionsPractice';
}

export function isPrePhase(stage: LearningStage): stage is PrePhaseStage {
  return stage === 'primer' || stage === 'workedExample' || stage === 'guidedPractice';
}

export function isMainPhase(stage: LearningStage): stage is MainPhase {
  return typeof stage === 'number';
}

export function getNextStage(current: LearningStage): LearningStage | null {
  if (isPrePhase(current)) {
    const currentIndex = PRE_PHASE_ORDER.indexOf(current);
    if (currentIndex < PRE_PHASE_ORDER.length - 1) {
      return PRE_PHASE_ORDER[currentIndex + 1];
    }
    return 1;
  }
  
  if (isBridgeStage(current)) {
    if (current === 'circuitBridge') {
      return 'memoryConnectionsPractice';
    }
    if (current === 'memoryConnectionsPractice') {
      return 3;
    }
  }
  
  if (isMainPhase(current)) {
    if (current === 2) {
      return 'circuitBridge';
    }
    if (current < 5) {
      return (current + 1) as MainPhase;
    }
  }
  
  return null;
}

export function getPreviousStage(current: LearningStage): LearningStage | null {
  if (isPrePhase(current)) {
    const currentIndex = PRE_PHASE_ORDER.indexOf(current);
    if (currentIndex > 0) {
      return PRE_PHASE_ORDER[currentIndex - 1];
    }
    return null;
  }
  
  if (isBridgeStage(current)) {
    if (current === 'circuitBridge') {
      return 2;
    }
    if (current === 'memoryConnectionsPractice') {
      return 'circuitBridge';
    }
  }
  
  if (isMainPhase(current)) {
    if (current === 1) {
      return 'guidedPractice';
    }
    if (current === 3) {
      return 'memoryConnectionsPractice';
    }
    if (current > 1) {
      return (current - 1) as MainPhase;
    }
  }
  
  return null;
}

export function stageToStorageKey(stage: LearningStage): string {
  if (isPrePhase(stage) || isBridgeStage(stage)) {
    return `${stage}Complete`;
  }
  return `phase${stage}Complete`;
}
