import { Block, RuntimeCtx } from '@/runtime/types';

// ============================================================
// PERCEPTION BLOCKS
// ============================================================

export const parseWearables: Block = {
  id: 'perception.parse',
  kind: 'perception',
  label: 'Parse Wearables',
  description: 'Extract raw sensor data from wearable device',
  run: (ctx: RuntimeCtx): RuntimeCtx => {
    const steps = ctx.input.steps || 0;
    const heartRate = ctx.input.heartRate || [];
    
    ctx.state.rawSteps = steps;
    ctx.state.rawHeartRate = heartRate;
    
    ctx.log.push({
      step: 'PERCEPTION_PARSE',
      data: { 
        action: 'Parsed wearable data',
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
  label: 'Smooth Wearables',
  description: 'Apply noise reduction to sensor readings',
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
        action: 'Smoothed sensor data',
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
  label: 'Threshold Reasoner',
  description: 'Simple rule-based activity classification',
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
        action: 'Applied threshold rules',
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
  label: 'Rule-Based Classifier',
  description: 'Multi-factor activity classification',
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
        action: 'Classified activity level',
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
  label: 'Daily Goal Planner',
  description: 'Create action plan based on activity',
  run: (ctx: RuntimeCtx): RuntimeCtx => {
    const activeToday = ctx.state.activeToday ?? false;
    const activityLevel = ctx.state.activityLevel ?? 'low';
    
    let plan: string;
    let message: string;
    
    if (activityLevel === 'excellent') {
      plan = 'congratulate';
      message = 'Amazing work! You exceeded your goals!';
    } else if (activeToday) {
      plan = 'congratulate';
      message = 'Great job hitting your step goal!';
    } else {
      plan = 'nudge';
      message = 'You can do it! Just a few more steps to reach your goal.';
    }
    
    ctx.state.plan = plan;
    ctx.state.message = message;
    
    ctx.log.push({
      step: 'PLANNING_DAILY',
      data: { 
        action: 'Created daily plan',
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
  label: 'Safety Planner',
  description: 'Check health metrics before suggesting activity',
  run: (ctx: RuntimeCtx): RuntimeCtx => {
    const elevatedHR = ctx.state.elevatedHR ?? false;
    const hrAvg = ctx.state.heartRateAvg ?? 0;
    const activeToday = ctx.state.activeToday ?? false;
    
    let plan: string;
    let message: string;
    let safetyWarning = false;
    
    if (elevatedHR && hrAvg > 160) {
      plan = 'rest';
      message = 'Your heart rate is elevated. Please rest and consult a doctor if this continues.';
      safetyWarning = true;
    } else if (elevatedHR) {
      plan = 'light_activity';
      message = 'Your heart rate is slightly elevated. Consider light activity only.';
    } else if (activeToday) {
      plan = 'congratulate';
      message = 'Great job! Your metrics look healthy.';
    } else {
      plan = 'encourage';
      message = 'Your health metrics are good - you can safely increase activity!';
    }
    
    ctx.state.plan = plan;
    ctx.state.message = message;
    ctx.state.safetyWarning = safetyWarning;
    
    ctx.log.push({
      step: 'PLANNING_SAFETY',
      data: { 
        action: 'Checked safety constraints',
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
  label: 'Send Notification',
  description: 'Deliver message to user',
  run: (ctx: RuntimeCtx): RuntimeCtx => {
    const plan = ctx.state.plan;
    const message = ctx.state.message ?? 'Keep up the good work!';
    
    if (!ctx.tools.sendNotification) {
      ctx.log.push({
        step: 'EXECUTION_ERROR',
        data: { 
          action: 'Failed to send notification',
          error: 'sendNotification tool not available',
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
        action: 'Sent notification',
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
  label: 'Update Streak',
  description: 'Update user progress and streak counter',
  run: (ctx: RuntimeCtx): RuntimeCtx => {
    const activeToday = ctx.state.activeToday ?? false;
    const currentStreak = ctx.state.currentStreak ?? 0;
    
    let newStreak: number;
    let streakAction: string;
    
    if (activeToday) {
      newStreak = currentStreak + 1;
      streakAction = 'incremented';
    } else {
      newStreak = 0;
      streakAction = 'reset';
    }
    
    ctx.state.streak = newStreak;
    ctx.state.streakUpdated = true;
    ctx.success = true;
    
    ctx.log.push({
      step: 'EXECUTION_STREAK',
      data: { 
        action: `Streak ${streakAction}`,
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
