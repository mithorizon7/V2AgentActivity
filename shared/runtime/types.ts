export type Process = 'perception' | 'reasoning' | 'planning' | 'execution';

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
