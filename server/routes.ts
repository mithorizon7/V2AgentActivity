import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProgressSchema } from "@shared/schema";
import { z } from "zod";
import { runPipeline, applyFailures, createInitialContext } from "../shared/runtime/engine";
import { Block, Process, RuntimeCtx, FailureConfig } from "../shared/runtime/types";
import { ALL_BLOCKS } from "../shared/scenarios/health-coach/blocks";
import fixturesData from "../shared/scenarios/health-coach/fixtures.json";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/progress", async (req, res) => {
    try {
      const validated = insertProgressSchema.parse(req.body);
      const progress = await storage.saveProgress(validated);
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to save progress" });
      }
    }
  });

  app.get("/api/progress/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const progress = await storage.getProgress(sessionId);
      
      if (!progress) {
        return res.status(404).json({ error: "Progress not found" });
      }
      
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve progress" });
    }
  });

  app.post("/api/classify", async (req, res) => {
    try {
      const { submissions, confidence } = req.body;
      
      if (!Array.isArray(submissions)) {
        return res.status(400).json({ error: "Submissions must be an array" });
      }

      const evaluations = submissions.map((submission: any) => {
        const classificationResult = storage.evaluateClassification({
          itemId: submission.itemId,
          selectedProcess: submission.selectedProcess,
        });
        const explanationResult = storage.evaluateExplanation(submission.explanation);
        
        return {
          itemId: submission.itemId,
          isCorrect: classificationResult.isCorrect,
          classificationFeedback: classificationResult.feedback,
          explanationScore: explanationResult.score,
          explanationFeedback: explanationResult.feedback,
        };
      });

      const correctCount = evaluations.filter((e) => e.isCorrect).length;
      const accuracy = (correctCount / evaluations.length) * 100;
      
      const avgExplanationScore = evaluations.reduce((acc, e) => acc + e.explanationScore, 0) / evaluations.length;
      
      const calibration = storage.calculateCalibration(confidence, accuracy);

      res.json({
        accuracy,
        explanationQuality: avgExplanationScore,
        calibration,
        evaluations,
        feedback: evaluations
          .filter((e) => !e.isCorrect)
          .map((e) => ({
            type: "incorrect",
            title: "Review this classification",
            message: e.classificationFeedback,
            itemId: e.itemId,
          })),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to evaluate classifications" });
    }
  });

  app.post("/api/boundary-map", async (req, res) => {
    try {
      const { sessionId, elements, connections } = req.body;
      
      if (!sessionId || !Array.isArray(elements) || !Array.isArray(connections)) {
        return res.status(400).json({ error: "Invalid boundary map data" });
      }

      const progress = await storage.getProgress(sessionId);
      if (!progress) {
        return res.status(404).json({ error: "Session not found" });
      }

      const completenessScore = Math.min(
        (elements.length / 4) * 50 + (connections.length / 6) * 50,
        100
      );

      const updated = await storage.updateProgress(sessionId, {
        boundaryMap: { elements, connections },
        assessmentScores: {
          ...progress.assessmentScores,
          boundaryMapCompleteness: completenessScore,
        },
      });

      res.json({
        completeness: completenessScore,
        progress: updated,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to save boundary map" });
    }
  });

  app.post("/api/circuit", async (req, res) => {
    try {
      const { sessionId, blocks, connections } = req.body;
      
      if (!sessionId || !Array.isArray(blocks) || !Array.isArray(connections)) {
        return res.status(400).json({ error: "Invalid circuit data" });
      }

      const progress = await storage.getProgress(sessionId);
      if (!progress) {
        return res.status(404).json({ error: "Session not found" });
      }

      const hasPerception = blocks.some((b: any) => b.type === "perception");
      const hasReasoning = blocks.some((b: any) => b.type === "reasoning");
      const hasExecution = blocks.some((b: any) => b.type === "execution");
      const isConnected = connections.length >= blocks.length - 1;

      const correctnessScore = 
        (hasPerception ? 25 : 0) +
        (hasReasoning ? 25 : 0) +
        (hasExecution ? 25 : 0) +
        (isConnected ? 25 : 0);

      const updated = await storage.updateProgress(sessionId, {
        circuit: { blocks, connections },
        assessmentScores: {
          ...progress.assessmentScores,
          circuitCorrectness: correctnessScore,
        },
      });

      res.json({
        correctness: correctnessScore,
        progress: updated,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to save circuit" });
    }
  });

  app.post("/api/simulate", async (req, res) => {
    try {
      const { sessionId, blockIds, fixtureId, failureConfig = {} } = req.body;
      
      if (!sessionId || !blockIds || !fixtureId) {
        return res.status(400).json({ error: "Missing required fields: sessionId, blockIds, fixtureId" });
      }

      // Create block registry for easy lookup
      const blockRegistry = new Map<string, Block>();
      ALL_BLOCKS.forEach(block => blockRegistry.set(block.id, block));

      // Build pipeline from block IDs
      const pipeline: Record<Process, Block> = {
        perception: blockRegistry.get(blockIds.perception),
        reasoning: blockRegistry.get(blockIds.reasoning),
        planning: blockRegistry.get(blockIds.planning),
        execution: blockRegistry.get(blockIds.execution),
      } as Record<Process, Block>;

      // Verify all blocks were found
      const missingBlocks = Object.entries(pipeline)
        .filter(([_, block]) => !block)
        .map(([process]) => process);
      
      if (missingBlocks.length > 0) {
        return res.status(400).json({ 
          error: "Invalid block IDs", 
          missingBlocks 
        });
      }

      // Get fixture data
      const fixture = fixturesData.find((f: any) => f.id === fixtureId);
      if (!fixture) {
        return res.status(400).json({ error: "Invalid fixture ID" });
      }

      // Create initial context with fixture input
      let ctx = createInitialContext(fixture.input);

      // Apply failures if configured
      const failures: FailureConfig = {
        noisyInput: failureConfig.noisyInput || false,
        missingTool: failureConfig.missingTool || undefined,
        staleMemory: failureConfig.staleMemory || false,
      };

      if (failures.noisyInput || failures.missingTool || failures.staleMemory) {
        ctx = applyFailures(ctx, failures);
      }

      // Run the pipeline
      const result = await runPipeline(pipeline, ctx);

      // Transform log into simulation steps
      const steps = result.log.map((logEntry, index) => ({
        id: `step-${index}`,
        blockId: logEntry.data?.blockId || 'system',
        timestamp: logEntry.timestamp,
        input: index > 0 ? result.log[index - 1].data : fixture.input,
        output: logEntry.data,
        status: logEntry.step.includes('ERROR') ? ('error' as const) : ('success' as const),
        message: logEntry.step,
      }));

      // Save to storage
      const progress = await storage.getProgress(sessionId);
      if (progress) {
        await storage.updateProgress(sessionId, {
          simulationResults: steps,
        });
      }

      res.json({ 
        steps,
        success: result.success,
        finalState: result.state,
      });
    } catch (error) {
      console.error('Simulation error:', error);
      res.status(500).json({ error: "Failed to run simulation" });
    }
  });

  app.get("/api/session/create", async (req, res) => {
    try {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const initialProgress = await storage.saveProgress({
        sessionId,
        currentPhase: 1,
        phaseCompletion: {
          "1": false,
          "2": false,
          "3": false,
          "4": false,
          "5": false,
        },
        classifications: [],
        confidenceLevel: 50,
        assessmentScores: {
          classificationAccuracy: 0,
          explanationQuality: 0,
          boundaryMapCompleteness: 0,
          circuitCorrectness: 0,
          calibration: 0,
        },
      });

      res.json({ sessionId, progress: initialProgress });
    } catch (error) {
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
