import {
  type User,
  type InsertUser,
  type LearnerProgress,
  type InsertProgress,
  type ClassificationSubmission,
  type BoundaryElement,
  type BoundaryConnection,
  type SimulationStep,
  type FailureMode,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProgress(sessionId: string): Promise<LearnerProgress | undefined>;
  saveProgress(progress: InsertProgress): Promise<LearnerProgress>;
  updateProgress(sessionId: string, updates: Partial<LearnerProgress>): Promise<LearnerProgress | undefined>;
  
  evaluateClassification(submission: ClassificationSubmission): { isCorrect: boolean; feedback: string };
  evaluateExplanation(explanation: string): { score: number; feedback: string };
  calculateCalibration(confidence: number, accuracy: number): number;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private progressData: Map<string, LearnerProgress>;

  constructor() {
    this.users = new Map();
    this.progressData = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProgress(sessionId: string): Promise<LearnerProgress | undefined> {
    return this.progressData.get(sessionId);
  }

  async saveProgress(progress: InsertProgress): Promise<LearnerProgress> {
    const existingProgress = this.progressData.get(progress.sessionId);
    
    const newProgress: LearnerProgress = {
      ...progress,
      createdAt: existingProgress?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    this.progressData.set(progress.sessionId, newProgress);
    return newProgress;
  }

  async updateProgress(
    sessionId: string,
    updates: Partial<LearnerProgress>
  ): Promise<LearnerProgress | undefined> {
    const existing = this.progressData.get(sessionId);
    if (!existing) return undefined;

    const updated: LearnerProgress = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    this.progressData.set(sessionId, updated);
    return updated;
  }

  private classificationAnswers: Map<string, any> = new Map([
    ["feedback_loops", { correctProcess: "learning", explanation: "Feedback loops enable the agent to learn from outcomes and adjust behavior" }],
    ["adaptation", { correctProcess: "learning", explanation: "Adaptation is the core of learning - modifying behavior based on new information" }],
    ["memory", { correctProcess: "learning", explanation: "Memory stores past interactions and learned patterns for future use" }],
    ["communication", { correctProcess: "interaction", explanation: "Communication is how the agent exchanges information with users and systems" }],
    ["api_integration", { correctProcess: "interaction", explanation: "APIs are the primary interaction mechanism with external systems" }],
    ["output_generation", { correctProcess: "interaction", explanation: "Generating outputs is the final step of interaction with users" }],
    ["input_processing", { correctProcess: "perception", explanation: "Processing inputs is how perception turns raw data into usable information" }],
    ["context_understanding", { correctProcess: "perception", explanation: "Understanding context is key to perception - making sense of the environment" }],
    ["state_tracking", { correctProcess: "perception", explanation: "Tracking state allows perception to maintain awareness of current conditions" }],
    ["logical_interface", { correctProcess: "reasoning", explanation: "Logical inference is the core of reasoning - drawing conclusions from data" }],
    ["knowledge_base", { correctProcess: "reasoning", explanation: "Knowledge bases provide the facts and rules needed for reasoning" }],
    ["heuristics", { correctProcess: "reasoning", explanation: "Heuristics are reasoning shortcuts that enable faster decision-making" }],
    ["optimization", { correctProcess: "planning", explanation: "Optimization finds the best strategy among possible plans" }],
    ["strategy", { correctProcess: "planning", explanation: "Strategy is the essence of planning - determining how to achieve goals" }],
    ["goal_setting", { correctProcess: "planning", explanation: "Setting goals is the first step in planning - defining what to achieve" }],
    ["monitoring", { correctProcess: "execution", explanation: "Monitoring ensures execution is proceeding as planned" }],
    ["tool_usage", { correctProcess: "execution", explanation: "Using tools is how execution carries out planned actions" }],
    ["action_selection", { correctProcess: "execution", explanation: "Selecting actions is the core of execution - choosing what to do next" }],
  ]);

  evaluateClassification(submission: { itemId: string; selectedProcess: string }): { isCorrect: boolean; feedback: string } {
    const correctAnswer = this.classificationAnswers.get(submission.itemId);
    
    if (!correctAnswer) {
      return { isCorrect: false, feedback: "Unknown item" };
    }

    const isCorrect = correctAnswer.correctProcess === submission.selectedProcess;
    
    const feedback = isCorrect
      ? `Correct! ${correctAnswer.explanation}.`
      : `This actually belongs to ${correctAnswer.correctProcess}. ${correctAnswer.explanation}.`;

    return { isCorrect, feedback };
  }

  evaluateExplanation(explanation: string): { score: number; feedback: string } {
    const wordCount = explanation.trim().split(/\s+/).length;
    const hasKeyTerms = /because|since|therefore|due to|when|while|process|function|system/i.test(explanation);
    const hasSpecifics = /\b(input|output|data|action|plan|decision|context)\b/i.test(explanation);

    let score = 0;
    let feedback = "";

    if (wordCount < 10) {
      score = 30;
      feedback = "Your explanation is too brief. Try to provide more detail about why this item belongs in this process category.";
    } else if (wordCount < 20) {
      score = hasKeyTerms ? 60 : 50;
      feedback = hasKeyTerms
        ? "Good start! Consider adding specific examples or connecting to the process's core function."
        : "Try to explain the reasoning behind your classification using connecting words like 'because' or 'since'.";
    } else {
      score = (hasKeyTerms ? 25 : 15) + (hasSpecifics ? 25 : 15) + (wordCount > 30 ? 10 : 0) + 50;
      feedback = score >= 80
        ? "Excellent explanation! You've clearly connected the item to the process's core function."
        : "Good explanation. You could strengthen it by being more specific about how this relates to the process.";
    }

    return { score: Math.min(score, 100), feedback };
  }

  calculateCalibration(confidence: number, accuracy: number): number {
    const error = Math.abs(confidence - accuracy);
    return Math.max(0, 100 - error);
  }
}

export const storage = new MemStorage();
