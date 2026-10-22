import {
  type User,
  type InsertUser,
  type LearnerProgress,
  type InsertProgress,
  type ClassificationInput,
  type ClassificationSubmission,
  type BoundaryElement,
  type BoundaryConnection,
  type SimulationStep,
  type FailureMode,
  type AgentProcess,
} from "@shared/schema";
import { getClassificationAnswer } from "@shared/classificationData";
import { randomUUID } from "crypto";

export type ProgressUpdates = Omit<Partial<LearnerProgress>, "sessionId" | "createdAt" | "updatedAt" | "assessmentScores"> & {
  assessmentScores?: Partial<LearnerProgress["assessmentScores"]>;
};

export class SessionCapacityError extends Error {}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProgress(sessionId: string): Promise<LearnerProgress | undefined>;
  saveProgress(progress: InsertProgress): Promise<LearnerProgress>;
  updateProgress(sessionId: string, updates: ProgressUpdates): Promise<LearnerProgress | undefined>;
  
  evaluateClassification(submission: ClassificationInput): { isCorrect: boolean; correctProcess: AgentProcess | null; explanationKey: string };
  evaluateExplanation(explanation: string): { score: number; feedbackKey: string };
  calculateCalibration(confidence: number, accuracy: number): number;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private progressData: Map<string, LearnerProgress>;
  private readonly sessionTtlMs = 24 * 60 * 60 * 1000;
  private readonly maxSessions = 2048;

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

  private activeProgress(sessionId: string): LearnerProgress | undefined {
    const progress = this.progressData.get(sessionId);
    if (progress && Date.now() - progress.updatedAt.getTime() >= this.sessionTtlMs) {
      this.progressData.delete(sessionId);
      return undefined;
    }
    return progress;
  }

  async getProgress(sessionId: string): Promise<LearnerProgress | undefined> {
    return this.activeProgress(sessionId);
  }

  async saveProgress(progress: InsertProgress): Promise<LearnerProgress> {
    for (const [id, entry] of this.progressData) {
      if (Date.now() - entry.updatedAt.getTime() >= this.sessionTtlMs) this.progressData.delete(id);
    }
    if (!this.progressData.has(progress.sessionId) && this.progressData.size >= this.maxSessions) {
      throw new SessionCapacityError("Session capacity reached");
    }
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
    updates: ProgressUpdates
  ): Promise<LearnerProgress | undefined> {
    const existing = this.activeProgress(sessionId);
    if (!existing) return undefined;

    const updated: LearnerProgress = {
      ...existing,
      ...updates,
      assessmentScores: { ...existing.assessmentScores, ...updates.assessmentScores },
      updatedAt: new Date(),
    };

    this.progressData.set(sessionId, updated);
    return updated;
  }

  evaluateClassification(submission: ClassificationInput): { isCorrect: boolean; correctProcess: AgentProcess | null; explanationKey: string } {
    const correctAnswer = getClassificationAnswer(submission.itemId);
    
    if (!correctAnswer) {
      return { isCorrect: false, correctProcess: null, explanationKey: "classificationFeedback.unknownItem" };
    }

    const isCorrect = correctAnswer.correctProcess === submission.selectedProcess;
    
    return { isCorrect, correctProcess: correctAnswer.correctProcess, explanationKey: correctAnswer.explanationKey };
  }

  evaluateExplanation(explanation: string): { score: number; feedbackKey: string } {
    // Handle null, undefined, or empty explanations
    if (!explanation || typeof explanation !== 'string') {
      return {
        score: 0,
        feedbackKey: "explanationFeedback.missing"
      };
    }

    const trimmed = explanation.trim();
    if (trimmed.length === 0) {
      return {
        score: 0,
        feedbackKey: "explanationFeedback.empty"
      };
    }

    const wordCount = trimmed.split(/\s+/).length;
    const hasKeyTerms = /because|since|therefore|due to|when|while|process|function|system/i.test(trimmed);
    const hasSpecifics = /\b(input|output|data|action|plan|decision|context)\b/i.test(trimmed);

    let score = 0;
    let feedback = "";

    if (wordCount < 10) {
      score = 30;
      feedback = "explanationFeedback.tooBrief";
    } else if (wordCount < 20) {
      score = hasKeyTerms ? 60 : 50;
      feedback = hasKeyTerms
        ? "explanationFeedback.goodStart"
        : "explanationFeedback.useConnectors";
    } else {
      score = (hasKeyTerms ? 25 : 15) + (hasSpecifics ? 25 : 15) + (wordCount > 30 ? 10 : 0) + 50;
      feedback = score >= 80
        ? "explanationFeedback.excellent"
        : "explanationFeedback.goodButSpecific";
    }

    return { score: Math.min(score, 100), feedbackKey: feedback };
  }

  calculateCalibration(confidence: number, accuracy: number): number {
    const error = Math.abs(confidence - accuracy);
    return Math.max(0, 100 - error);
  }
}
