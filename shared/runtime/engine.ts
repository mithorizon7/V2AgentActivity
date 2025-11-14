import { RuntimeCtx, Block, Process, FailureConfig } from './types';

export async function runPipeline(
  pipeline: Record<Process, Block>,
  ctx: RuntimeCtx
): Promise<RuntimeCtx> {
  let current = ctx;
  const processes: Process[] = ['perception', 'reasoning', 'planning', 'execution'];
  
  for (const process of processes) {
    const block = pipeline[process];
    if (!block) {
      current.log.push({
        step: `ERROR_${process.toUpperCase()}`,
        data: { error: 'No block selected for this process' },
        timestamp: Date.now(),
      });
      current.success = false;
      return current;
    }

    current.log.push({
      step: `START_${process.toUpperCase()}`,
      data: { blockId: block.id, blockLabel: block.label },
      timestamp: Date.now(),
    });

    try {
      current = await block.run(current);
      
      current.log.push({
        step: `END_${process.toUpperCase()}`,
        data: { 
          blockId: block.id,
          state: { ...current.state },
          success: true,
        },
        timestamp: Date.now(),
      });
    } catch (error) {
      current.log.push({
        step: `ERROR_${process.toUpperCase()}`,
        data: { 
          blockId: block.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: Date.now(),
      });
      current.success = false;
      return current;
    }
  }

  return current;
}

export function applyFailures(
  baseCtx: RuntimeCtx,
  failures: FailureConfig
): RuntimeCtx {
  // Deep copy everything except tools (which contain functions)
  // Create a temp context without tools for structured cloning
  const { tools, ...clonableCtx } = baseCtx;
  
  const ctx: RuntimeCtx = {
    ...structuredClone(clonableCtx),
    tools: { ...tools }, // Shallow copy of tools to preserve functions
  };

  if (failures.noisyInput) {
    // Use deterministic noise pattern based on array indices
    if (Array.isArray(ctx.input.heartRate)) {
      const noisyHR: number[] = [];
      ctx.input.heartRate.forEach((hr: number, index: number) => {
        // Deterministic noise: alternating ±15 BPM based on index
        const noise = index % 2 === 0 ? 15 : -15;
        noisyHR.push(hr + noise);
      });
      ctx.input.heartRate = noisyHR;
    }
    
    if (typeof ctx.input.steps === 'number') {
      // Deterministic noise: subtract 800 steps
      const noisySteps = Math.max(0, ctx.input.steps - 800);
      ctx.input.steps = noisySteps;
    }
    
    ctx.log.push({
      step: 'FAILURE_INJECTED_NOISY_INPUT',
      data: { 
        type: 'noisyInput', 
        description: 'Deterministic sensor corruption applied',
        hrNoise: '±15 BPM alternating pattern',
        stepsNoise: '-800 steps',
      },
      timestamp: Date.now(),
    });
  }

  if (failures.missingTool) {
    delete ctx.tools[failures.missingTool];
    ctx.log.push({
      step: 'FAILURE_INJECTED_MISSING_TOOL',
      data: { type: 'missingTool', tool: failures.missingTool },
      timestamp: Date.now(),
    });
  }

  if (failures.staleMemory) {
    ctx.state = {};
    ctx.log.push({
      step: 'FAILURE_INJECTED_STALE_MEMORY',
      data: { type: 'staleMemory', description: 'Cleared all memory state' },
      timestamp: Date.now(),
    });
  }

  return ctx;
}

// Development-only runtime logger
function runtimeLog(...args: any[]) {
  // Use import.meta.env for Vite compatibility (works in both browser and server)
  if (import.meta.env?.DEV) {
    console.log(...args);
  }
}

export function createInitialContext(input: any): RuntimeCtx {
  return {
    input,
    state: {},
    tools: {
      sendNotification: (args: { type: string; message?: string }) => {
        runtimeLog('[TOOL] sendNotification:', args);
        return { sent: true, type: args.type };
      },
      readSteps: () => {
        runtimeLog('[TOOL] readSteps');
        return { steps: input.steps || 0 };
      },
      readHeartRate: () => {
        runtimeLog('[TOOL] readHeartRate');
        return { heartRate: input.heartRate || [] };
      },
    },
    log: [],
    success: undefined,
  };
}
