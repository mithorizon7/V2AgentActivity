import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const agentProcesses = ["learning", "interaction", "perception", "reasoning", "planning", "execution"] as const;
export type AgentProcess = typeof agentProcesses[number];
export const sessionIdSchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid session ID format");

// Zod schema for AgentProcess validation
export const agentProcessSchema = z.enum(agentProcesses);

export type ClassificationItem = {
  id: string;
  text: string;
  correctProcess: AgentProcess;
  category?: "generic" | "health-coach";
};

// Zod schema for ClassificationItem validation
export const classificationItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  correctProcess: agentProcessSchema,
  category: z.enum(["generic", "health-coach"]).optional(),
});

// Zod schemas for localStorage state validation
export const classificationUnsortedSchema = z.array(classificationItemSchema);
export const classificationSortedSchema = z.record(
  z.enum(["learning", "interaction", "perception", "reasoning", "planning", "execution"]),
  z.array(classificationItemSchema)
);

// Input type for classification evaluation (before correctness is determined)
export type ClassificationInput = {
  itemId: string;
  selectedProcess: AgentProcess;
  explanation: string;
};

// Result type after evaluation (includes isCorrect)
export type ClassificationSubmission = {
  itemId: string;
  selectedProcess: AgentProcess;
  explanation: string;
  isCorrect: boolean;
};

export type BoundaryElement = {
  id: string;
  label: string;
  type: "api" | "memory" | "sensor" | "ui" | "log";
  x: number;
  y: number;
};

export type BoundaryConnection = {
  id: string;
  elementId: string;
  process: AgentProcess;
  label?: string;
};

export type CircuitBlock = {
  id: string;
  type: AgentProcess;
  label: string;
  x: number;
  y: number;
  inputs: string[];
  outputs: string[];
};

export type CircuitConnection = {
  id: string;
  from: string;
  to: string;
};

export type SimulationStep = {
  id: string;
  blockId: string;
  timestamp: number;
  input?: any;
  output?: any;
  status: "success" | "error" | "pending";
  message?: string;
};

export type FailureMode = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  affectedProcess: AgentProcess;
};

export type LearnerProgress = {
  sessionId: string;
  currentPhase: number;
  phaseCompletion: Record<string, boolean>;
  classifications: ClassificationSubmission[];
  confidenceLevel: number;
  boundaryMap?: {
    elements: BoundaryElement[];
    connections: BoundaryConnection[];
  };
  circuit?: {
    blocks: CircuitBlock[];
    connections: CircuitConnection[];
  };
  simulationResults?: SimulationStep[];
  failureModes?: FailureMode[];
  assessmentScores: {
    classificationAccuracy: number;
    explanationQuality: number;
    boundaryMapCompleteness: number;
    circuitCorrectness: number;
    calibration: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  process: AgentProcess;
  example?: string;
};

export type FeedbackMessage = {
  itemId: string;
  type: "correct" | "incorrect" | "hint" | "common-confusion";
  message: string;
  explanation?: string;
};

// Zod schemas for API request validation
export const boundaryElementSchema = z.object({
  id: z.string().min(1).max(128),
  label: z.string().max(300),
  type: z.enum(["api", "memory", "sensor", "ui", "log"]),
  x: z.number().finite().min(0).max(100_000),
  y: z.number().finite().min(0).max(100_000),
});

export const boundaryConnectionSchema = z.object({
  id: z.string().min(1).max(128),
  elementId: z.string().min(1).max(128),
  process: z.enum(agentProcesses),
  label: z.string().max(300).optional(),
});

export const circuitBlockSchema = z.object({
  id: z.string().min(1).max(128),
  type: z.enum(agentProcesses),
  label: z.string().max(300),
  x: z.number().finite().min(-100_000).max(100_000),
  y: z.number().finite().min(-100_000).max(100_000),
  inputs: z.array(z.string().max(128)).max(64),
  outputs: z.array(z.string().max(128)).max(64),
});

export const circuitConnectionSchema = z.object({
  id: z.string().min(1).max(128),
  from: z.string().min(1).max(128),
  to: z.string().min(1).max(128),
});

export const simulationStepSchema = z.object({
  id: z.string(),
  blockId: z.string(),
  timestamp: z.number(),
  input: z.any().optional(),
  output: z.any().optional(),
  status: z.enum(["success", "error", "pending"]),
  message: z.string().optional(),
});

export const failureModeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
  affectedProcess: z.enum(agentProcesses),
});

// API request schemas
export const classifyRequestSchema = z.object({
  sessionId: sessionIdSchema,
  submissions: z.array(z.object({
    itemId: z.string().min(1).max(128),
    selectedProcess: z.enum(agentProcesses),
    explanation: z.string().max(4000),
  })).min(1, "At least one submission is required").max(64),
  confidence: z.number().min(0).max(100),
});

export const boundaryMapRequestSchema = z.object({
  sessionId: sessionIdSchema,
  elements: z.array(boundaryElementSchema).max(64),
  connections: z.array(boundaryConnectionSchema).max(384),
});

export const circuitRequestSchema = z.object({
  sessionId: sessionIdSchema,
  blocks: z.array(circuitBlockSchema).max(64),
  connections: z.array(circuitConnectionSchema).max(384),
});

export const simulateRequestSchema = z.object({
  sessionId: sessionIdSchema,
  blockIds: z.object({
    perception: z.string().min(1).max(128),
    reasoning: z.string().min(1).max(128),
    planning: z.string().min(1).max(128),
    execution: z.string().min(1).max(128),
  }),
  fixtureId: z.string().min(1).max(128),
  failureConfig: z.object({
    noisyInput: z.boolean().optional(),
    missingTool: z.enum(["sendNotification", "readSteps", "readHeartRate"]).optional(),
    staleMemory: z.boolean().optional(),
  }).optional(),
});

export const insertProgressSchema = z.object({
  sessionId: sessionIdSchema,
  currentPhase: z.number().min(0).max(5),
  phaseCompletion: z.record(z.boolean()),
  classifications: z.array(z.object({
    itemId: z.string(),
    selectedProcess: z.enum(agentProcesses),
    explanation: z.string(),
    isCorrect: z.boolean(),
  })),
  confidenceLevel: z.number().min(0).max(100),
  boundaryMap: z.object({
    elements: z.array(boundaryElementSchema),
    connections: z.array(boundaryConnectionSchema),
  }).optional(),
  circuit: z.object({
    blocks: z.array(circuitBlockSchema),
    connections: z.array(circuitConnectionSchema),
  }).optional(),
  simulationResults: z.array(simulationStepSchema).optional(),
  failureModes: z.array(failureModeSchema).optional(),
  assessmentScores: z.object({
    classificationAccuracy: z.number(),
    explanationQuality: z.number(),
    boundaryMapCompleteness: z.number(),
    circuitCorrectness: z.number(),
    calibration: z.number(),
  }),
});

export type InsertProgress = z.infer<typeof insertProgressSchema>;
