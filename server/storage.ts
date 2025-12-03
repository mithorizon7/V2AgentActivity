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
} from "@shared/schema";
import { getClassificationAnswer } from "@shared/classificationData";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProgress(sessionId: string): Promise<LearnerProgress | undefined>;
  saveProgress(progress: InsertProgress): Promise<LearnerProgress>;
  updateProgress(sessionId: string, updates: Partial<LearnerProgress>): Promise<LearnerProgress | undefined>;
  
  evaluateClassification(submission: ClassificationInput): { isCorrect: boolean; feedback: string };
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

  evaluateClassification(submission: ClassificationInput): { isCorrect: boolean; feedback: string } {
    const correctAnswer = getClassificationAnswer(submission.itemId);
    
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
    // Handle null, undefined, or empty explanations
    if (!explanation || typeof explanation !== 'string') {
      return {
        score: 0,
        feedback: "No explanation provided. Please explain your reasoning."
      };
    }

    const trimmed = explanation.trim();
    if (trimmed.length === 0) {
      return {
        score: 0,
        feedback: "Explanation is empty. Please provide your reasoning."
      };
    }

    const wordCount = trimmed.split(/\s+/).length;
    const hasKeyTerms = /because|since|therefore|due to|when|while|process|function|system/i.test(trimmed);
    const hasSpecifics = /\b(input|output|data|action|plan|decision|context)\b/i.test(trimmed);

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
