// 4+2 Model: 4-stage run loop + 2 supporting systems
export const RUN_LOOP = ['perception', 'reasoning', 'planning', 'execution'] as const;
export const SUPPORTING = ['learning', 'interaction'] as const;

export type RunLoopProcess = typeof RUN_LOOP[number];
export type SupportingProcess = typeof SUPPORTING[number];
export type Process = RunLoopProcess;
export type AgentProcess = RunLoopProcess | SupportingProcess;

export interface RuntimeCtx {
  input: any;
  state: Record<string, any>;
  tools: Record<string, (args: any) => any>;
  log: Array<{ step: string; data: any; timestamp: number }>;
  success?: boolean;
}

export interface Block {
  id: string;
  kind: Process;
  label: string;
  description: string;
  run: (ctx: RuntimeCtx) => Promise<RuntimeCtx> | RuntimeCtx;
  usesMemory?: boolean;       // true if reads/writes ctx.state
  toolCalls?: string[];       // e.g. ['sendNotification']
}

export interface FailureConfig {
  noisyInput?: boolean;
  missingTool?: string;
  staleMemory?: boolean;
}

export interface Fixture {
  id: string;
  name: string;
  description: string;
  input: any;
  expectedOutcome: string;
}
