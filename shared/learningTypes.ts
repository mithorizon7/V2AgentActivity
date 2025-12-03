export type PrePhaseStage = 'primer' | 'workedExample' | 'guidedPractice';
export type MainPhase = 1 | 2 | 3 | 4 | 5;
export type LearningStage = PrePhaseStage | MainPhase;

export const PRE_PHASE_ORDER: PrePhaseStage[] = ['primer', 'workedExample', 'guidedPractice'];

export function isPrePhase(stage: LearningStage): stage is PrePhaseStage {
  return typeof stage === 'string';
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
  
  if (current < 5) {
    return (current + 1) as MainPhase;
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
  
  if (current === 1) {
    return 'guidedPractice';
  }
  
  if (current > 1) {
    return (current - 1) as MainPhase;
  }
  
  return null;
}

export function stageToStorageKey(stage: LearningStage): string {
  if (isPrePhase(stage)) {
    return `${stage}Complete`;
  }
  return `phase${stage}Complete`;
}
