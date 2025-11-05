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

export type ClassificationItem = {
  id: string;
  text: string;
  correctProcess: AgentProcess;
  category?: "generic" | "health-coach";
};

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
  input: any;
  output: any;
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
    elements: z.array(z.any()),
    connections: z.array(z.any()),
  }).optional(),
  circuit: z.object({
    blocks: z.array(z.any()),
    connections: z.array(z.any()),
  }).optional(),
  simulationResults: z.array(z.any()).optional(),
  failureModes: z.array(z.any()).optional(),
  assessmentScores: z.object({
    classificationAccuracy: z.number(),
    explanationQuality: z.number(),
    boundaryMapCompleteness: z.number(),
    circuitCorrectness: z.number(),
    calibration: z.number(),
  }),
});

export type InsertProgress = z.infer<typeof insertProgressSchema>;
