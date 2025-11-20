import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const agentProcesses = ["learning", "interaction", "perception", "reasoning", "planning", "execution"] as const;
export type AgentProcess = typeof agentProcesses[number];

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
  id: z.string(),
  label: z.string(),
  type: z.enum(["api", "memory", "sensor", "ui", "log"]),
  x: z.number(),
  y: z.number(),
});

export const boundaryConnectionSchema = z.object({
  id: z.string(),
  elementId: z.string(),
  process: z.enum(agentProcesses),
  label: z.string().optional(),
});

export const circuitBlockSchema = z.object({
  id: z.string(),
  type: z.enum(agentProcesses),
  label: z.string(),
  x: z.number(),
  y: z.number(),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
});

export const circuitConnectionSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
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
  submissions: z.array(z.object({
    itemId: z.string().min(1),
    selectedProcess: z.enum(agentProcesses),
    explanation: z.string().min(1, "Explanation is required"),
  })).min(1, "At least one submission is required"),
  confidence: z.number().min(0).max(100),
});

export const boundaryMapRequestSchema = z.object({
  sessionId: z.string().min(1),
  elements: z.array(boundaryElementSchema),
  connections: z.array(boundaryConnectionSchema),
});

export const circuitRequestSchema = z.object({
  sessionId: z.string().min(1),
  blocks: z.array(circuitBlockSchema),
  connections: z.array(circuitConnectionSchema),
});

export const simulateRequestSchema = z.object({
  sessionId: z.string().min(1),
  blockIds: z.object({
    perception: z.string().min(1),
    reasoning: z.string().min(1),
    planning: z.string().min(1),
    execution: z.string().min(1),
  }),
  fixtureId: z.string().min(1),
  failureConfig: z.object({
    noisyInput: z.boolean().optional(),
    missingTool: z.string().optional(),
    staleMemory: z.boolean().optional(),
  }).optional(),
});

export const insertProgressSchema = z.object({
  sessionId: z.string(),
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
