import { Block, RuntimeCtx } from '@/runtime/types';

// ============================================================
// PERCEPTION BLOCKS
// ============================================================

export const parseWearables: Block = {
  id: 'perception.parse',
  kind: 'perception',
  label: 'healthCoach.blocks.perception.parse.name',
  description: 'healthCoach.blocks.perception.parse.description',
  run: (ctx: RuntimeCtx): RuntimeCtx => {
    const steps = ctx.input.steps || 0;
    const heartRate = ctx.input.heartRate || [];
    
    ctx.state.rawSteps = steps;
    ctx.state.rawHeartRate = heartRate;
    
    ctx.log.push({
      step: 'PERCEPTION_PARSE',
      data: { 
        action: 'healthCoach.runtime.perception.parse.action',
        rawSteps: steps,
        rawHeartRateSamples: heartRate.length,
      },
      timestamp: Date.now(),
    });
    
    return ctx;
  },
};

export const smoothWearables: Block = {
  id: 'perception.smooth',
  kind: 'perception',
  label: 'healthCoach.blocks.perception.smooth.name',
  description: 'healthCoach.blocks.perception.smooth.description',
  run: (ctx: RuntimeCtx): RuntimeCtx => {
    const steps = ctx.input.steps || 0;
    const heartRate = ctx.input.heartRate || [];
    
    // Smooth heart rate using moving average
    let smoothedHR = 0;
    if (heartRate.length > 0) {
      const sum = heartRate.reduce((acc: number, val: number) => acc + val, 0);
      smoothedHR = Math.round(sum / heartRate.length);
    }
    
    ctx.state.steps = steps;
    ctx.state.heartRateAvg = smoothedHR;
    
    ctx.log.push({
      step: 'PERCEPTION_SMOOTH',
      data: { 
        action: 'healthCoach.runtime.perception.smooth.action',
        steps,
        heartRateAvg: smoothedHR,
        originalSamples: heartRate.length,
      },
      timestamp: Date.now(),
    });
    
    return ctx;
  },
};

// ============================================================
// REASONING BLOCKS
// ============================================================

export const thresholdCheck: Block = {
  id: 'reasoning.threshold',
  kind: 'reasoning',
  label: 'healthCoach.blocks.reasoning.threshold.name',
  description: 'healthCoach.blocks.reasoning.threshold.description',
  run: (ctx: RuntimeCtx): RuntimeCtx => {
    const steps = ctx.state.steps ?? ctx.input.steps ?? 0;
    const hrAvg = ctx.state.heartRateAvg ?? 0;
    
    const activeToday = steps > 8000;
    const elevatedHR = hrAvg > 150;
    
    ctx.state.activeToday = activeToday;
    ctx.state.elevatedHR = elevatedHR;
    ctx.state.activityLevel = activeToday ? 'high' : 'low';
    
    ctx.log.push({
      step: 'REASONING_THRESHOLD',
      data: { 
        action: 'healthCoach.runtime.reasoning.threshold.action',
        steps,
        hrAvg,
        activeToday,
        elevatedHR,
        activityLevel: ctx.state.activityLevel,
      },
      timestamp: Date.now(),
    });
    
    return ctx;
  },
};

export const ruleClassifier: Block = {
  id: 'reasoning.classifier',
  kind: 'reasoning',
  label: 'healthCoach.blocks.reasoning.ruleBased.name',
  description: 'healthCoach.blocks.reasoning.ruleBased.description',
  run: (ctx: RuntimeCtx): RuntimeCtx => {
    const steps = ctx.state.steps ?? ctx.input.steps ?? 0;
    const hrAvg = ctx.state.heartRateAvg ?? 0;
    
    let activityLevel: string;
    let recommendation: string;
    
    if (steps > 10000 && hrAvg < 140) {
      activityLevel = 'excellent';
      recommendation = 'maintain';
    } else if (steps > 8000 && hrAvg < 150) {
      activityLevel = 'good';
      recommendation = 'maintain';
    } else if (steps > 5000) {
      activityLevel = 'moderate';
      recommendation = 'increase';
    } else {
      activityLevel = 'low';
      recommendation = 'urgent_increase';
    }
    
    ctx.state.activeToday = steps > 8000;
    ctx.state.elevatedHR = hrAvg > 150;
    ctx.state.activityLevel = activityLevel;
    ctx.state.recommendation = recommendation;
    
    ctx.log.push({
      step: 'REASONING_CLASSIFY',
      data: { 
        action: 'healthCoach.runtime.reasoning.classify.action',
        steps,
        hrAvg,
        activityLevel,
        recommendation,
      },
      timestamp: Date.now(),
    });
    
    return ctx;
  },
};

// ============================================================
// PLANNING BLOCKS
// ============================================================

export const dailyPlanner: Block = {
  id: 'planning.daily',
  kind: 'planning',
  label: 'healthCoach.blocks.planning.daily.name',
  description: 'healthCoach.blocks.planning.daily.description',
  run: (ctx: RuntimeCtx): RuntimeCtx => {
    const activeToday = ctx.state.activeToday ?? false;
    const activityLevel = ctx.state.activityLevel ?? 'low';
    
    let plan: string;
    let message: string;
    
    if (activityLevel === 'excellent') {
      plan = 'congratulate';
      message = 'healthCoach.runtime.planning.daily.message.excellent';
    } else if (activeToday) {
      plan = 'congratulate';
      message = 'healthCoach.runtime.planning.daily.message.active';
    } else {
      plan = 'nudge';
      message = 'healthCoach.runtime.planning.daily.message.nudge';
    }
    
    ctx.state.plan = plan;
    ctx.state.message = message;
    
    ctx.log.push({
      step: 'PLANNING_DAILY',
      data: { 
        action: 'healthCoach.runtime.planning.daily.action',
        activeToday,
        activityLevel,
        plan,
        message,
      },
      timestamp: Date.now(),
    });
    
    return ctx;
  },
};

export const safetyPlanner: Block = {
  id: 'planning.safety',
  kind: 'planning',
  label: 'healthCoach.blocks.planning.weekly.name',
  description: 'healthCoach.blocks.planning.weekly.description',
  run: (ctx: RuntimeCtx): RuntimeCtx => {
    const elevatedHR = ctx.state.elevatedHR ?? false;
    const hrAvg = ctx.state.heartRateAvg ?? 0;
    const activeToday = ctx.state.activeToday ?? false;
    
    let plan: string;
    let message: string;
    let safetyWarning = false;
    
    if (elevatedHR && hrAvg > 160) {
      plan = 'rest';
      message = 'healthCoach.runtime.planning.safety.message.rest';
      safetyWarning = true;
    } else if (elevatedHR) {
      plan = 'light_activity';
      message = 'healthCoach.runtime.planning.safety.message.lightActivity';
    } else if (activeToday) {
      plan = 'congratulate';
      message = 'healthCoach.runtime.planning.safety.message.congratulate';
    } else {
      plan = 'encourage';
      message = 'healthCoach.runtime.planning.safety.message.encourage';
    }
    
    ctx.state.plan = plan;
    ctx.state.message = message;
    ctx.state.safetyWarning = safetyWarning;
    
    ctx.log.push({
      step: 'PLANNING_SAFETY',
      data: { 
        action: 'healthCoach.runtime.planning.safety.action',
        elevatedHR,
        hrAvg,
        plan,
        message,
        safetyWarning,
      },
      timestamp: Date.now(),
    });
    
    return ctx;
  },
};

// ============================================================
// EXECUTION BLOCKS
// ============================================================

export const sendNotification: Block = {
  id: 'execution.notify',
  kind: 'execution',
  label: 'healthCoach.blocks.execution.notify.name',
  description: 'healthCoach.blocks.execution.notify.description',
  run: (ctx: RuntimeCtx): RuntimeCtx => {
    const plan = ctx.state.plan;
    const message = ctx.state.message ?? 'healthCoach.runtime.execution.notify.defaultMessage';
    
    if (!ctx.tools.sendNotification) {
      ctx.log.push({
        step: 'EXECUTION_ERROR',
        data: { 
          action: 'healthCoach.runtime.execution.notify.error',
          error: 'healthCoach.runtime.execution.notify.errorDetails',
        },
        timestamp: Date.now(),
      });
      ctx.success = false;
      return ctx;
    }
    
    const result = ctx.tools.sendNotification({ type: plan, message });
    
    ctx.state.notificationSent = true;
    ctx.state.notificationType = plan;
    ctx.success = true;
    
    ctx.log.push({
      step: 'EXECUTION_NOTIFY',
      data: { 
        action: 'healthCoach.runtime.execution.notify.action',
        type: plan,
        message,
        result,
      },
      timestamp: Date.now(),
    });
    
    return ctx;
  },
};

export const updateStreak: Block = {
  id: 'execution.streak',
  kind: 'execution',
  label: 'healthCoach.blocks.execution.followup.name',
  description: 'healthCoach.blocks.execution.followup.description',
  run: (ctx: RuntimeCtx): RuntimeCtx => {
    const activeToday = ctx.state.activeToday ?? false;
    const currentStreak = ctx.state.currentStreak ?? 0;
    
    let newStreak: number;
    let streakAction: string;
    
    if (activeToday) {
      newStreak = currentStreak + 1;
      streakAction = 'healthCoach.runtime.execution.streak.actionIncremented';
    } else {
      newStreak = 0;
      streakAction = 'healthCoach.runtime.execution.streak.actionReset';
    }
    
    ctx.state.streak = newStreak;
    ctx.state.streakUpdated = true;
    ctx.success = true;
    
    ctx.log.push({
      step: 'EXECUTION_STREAK',
      data: { 
        action: streakAction,
        activeToday,
        previousStreak: currentStreak,
        newStreak,
      },
      timestamp: Date.now(),
    });
    
    return ctx;
  },
};

// ============================================================
// BLOCK REGISTRY
// ============================================================

export const PERCEPTION_BLOCKS: Block[] = [parseWearables, smoothWearables];
export const REASONING_BLOCKS: Block[] = [thresholdCheck, ruleClassifier];
export const PLANNING_BLOCKS: Block[] = [dailyPlanner, safetyPlanner];
export const EXECUTION_BLOCKS: Block[] = [sendNotification, updateStreak];

export const ALL_BLOCKS: Block[] = [
  ...PERCEPTION_BLOCKS,
  ...REASONING_BLOCKS,
  ...PLANNING_BLOCKS,
  ...EXECUTION_BLOCKS,
];
