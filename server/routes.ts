import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { SessionCapacityError } from "./storage";
import { storage } from "./storageProvider";
import { 
  classifyRequestSchema,
  boundaryMapRequestSchema,
  circuitRequestSchema,
  simulateRequestSchema,
  sessionIdSchema,
  type BoundaryElement,
  type BoundaryConnection,
  type CircuitBlock,
  type CircuitConnection,
} from "@shared/schema";
import { z } from "zod";
import { runPipeline, applyFailures, createInitialContext } from "../shared/runtime/engine";
import { Block, Process, FailureConfig, Fixture } from "../shared/runtime/types";
import { ALL_BLOCKS } from "../shared/scenarios/health-coach/blocks";
import fixturesData from "../shared/scenarios/health-coach/fixtures.json";
import { randomUUID } from "crypto";
import { rateLimit } from "./security";

const sessionIdParamSchema = z.object({
  sessionId: sessionIdSchema,
});

const FIXTURES: Fixture[] = fixturesData as Fixture[];

function findDuplicateIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  ids.forEach((id) => {
    if (seen.has(id)) {
      duplicates.add(id);
      return;
    }
    seen.add(id);
  });

  return Array.from(duplicates);
}

function validateBoundaryMapGraph(elements: BoundaryElement[], connections: BoundaryConnection[]) {
  const duplicateElementIds = findDuplicateIds(elements.map((element) => element.id));
  const duplicateConnectionIds = findDuplicateIds(connections.map((connection) => connection.id));
  const validElementIds = new Set(elements.map((element) => element.id));
  const danglingConnectionElementIds = Array.from(
    new Set(
      connections
        .filter((connection) => !validElementIds.has(connection.elementId))
        .map((connection) => connection.elementId)
    )
  );

  return {
    duplicateElementIds,
    duplicateConnectionIds,
    danglingConnectionElementIds,
  };
}

function validateCircuitGraph(blocks: CircuitBlock[], connections: CircuitConnection[]) {
  const duplicateBlockIds = findDuplicateIds(blocks.map((block) => block.id));
  const duplicateConnectionIds = findDuplicateIds(connections.map((connection) => connection.id));
  const validBlockIds = new Set(blocks.map((block) => block.id));
  const danglingConnectionIds = connections
    .filter((connection) => !validBlockIds.has(connection.from) || !validBlockIds.has(connection.to))
    .map((connection) => connection.id);
  const selfLoopConnectionIds = connections
    .filter((connection) => connection.from === connection.to)
    .map((connection) => connection.id);

  return {
    duplicateBlockIds,
    duplicateConnectionIds,
    danglingConnectionIds,
    selfLoopConnectionIds,
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Progress is updated only by the validated activity routes, never by a full-record upsert.
  app.post("/api/progress", (_req, res) => {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Use the activity endpoints to update progress" });
  });

  app.get("/api/progress", async (req, res) => {
    try {
      const { sessionId } = sessionIdParamSchema.parse({
        sessionId: req.get("Authorization")?.match(/^Bearer (\S+)$/)?.[1],
      });
      const progress = await storage.getProgress(sessionId);
      
      if (!progress) {
        return res.status(404).json({ error: "Progress not found" });
      }
      
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(401).json({ error: "Valid session bearer token required" });
      }
      res.status(500).json({ error: "Failed to retrieve progress" });
    }
  });

  app.post("/api/classify", async (req, res) => {
    try {
      const validated = classifyRequestSchema.parse(req.body);
      const { submissions, confidence, sessionId } = validated;
      if (findDuplicateIds(submissions.map((submission) => submission.itemId)).length ||
          submissions.some((submission) => storage.evaluateClassification(submission).correctProcess === null)) {
        return res.status(400).json({ error: "Unknown or duplicate classification items" });
      }

      const evaluations = submissions.map((submission) => {
        const classificationResult = storage.evaluateClassification(submission);
        const explanationResult = storage.evaluateExplanation(submission.explanation);
        
        return {
          itemId: submission.itemId,
          isCorrect: classificationResult.isCorrect,
          correctProcess: classificationResult.correctProcess,
          explanationKey: classificationResult.explanationKey,
          explanationScore: explanationResult.score,
          explanationFeedbackKey: explanationResult.feedbackKey,
        };
      });

      const correctCount = evaluations.filter((e) => e.isCorrect).length;
      const accuracy = evaluations.length > 0 ? (correctCount / evaluations.length) * 100 : 0;
      
      const avgExplanationScore = evaluations.length > 0 
        ? evaluations.reduce((acc, e) => acc + e.explanationScore, 0) / evaluations.length 
        : 0;
      
      const calibration = storage.calculateCalibration(confidence, accuracy);

      const progress = await storage.getProgress(sessionId);
      if (!progress) {
        return res.status(404).json({ error: "Session not found" });
      }

      const submissionsWithCorrectness = submissions.map((submission) => {
        const evaluation = evaluations.find((e) => e.itemId === submission.itemId);
        return {
          ...submission,
          isCorrect: evaluation?.isCorrect ?? false,
        };
      });

      const updated = await storage.updateProgress(sessionId, {
        classifications: submissionsWithCorrectness,
        confidenceLevel: confidence,
        assessmentScores: {
          classificationAccuracy: accuracy,
          explanationQuality: avgExplanationScore,
          calibration,
        },
      });

      if (!updated) return res.status(404).json({ error: "Session not found" });
      res.json({
        accuracy,
        explanationQuality: avgExplanationScore,
        calibration,
        evaluations,
        feedback: evaluations
          .filter((e) => !e.isCorrect)
          .map((e) => ({
            type: "incorrect",
            titleKey: "classification.feedback.reviewTitle",
            messageKey: "classification.feedback.incorrect",
            messageParams: {
              process: e.correctProcess,
              explanationKey: e.explanationKey,
            },
            itemId: e.itemId,
          })),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.issues });
      }
      res.status(500).json({ error: "Failed to evaluate classifications" });
    }
  });

  app.post("/api/boundary-map", async (req, res) => {
    try {
      const validated = boundaryMapRequestSchema.parse(req.body);
      const { sessionId, elements, connections } = validated;

      const progress = await storage.getProgress(sessionId);
      if (!progress) {
        return res.status(404).json({ error: "Session not found" });
      }

      const graphValidation = validateBoundaryMapGraph(elements, connections);
      if (
        graphValidation.duplicateElementIds.length > 0 ||
        graphValidation.duplicateConnectionIds.length > 0 ||
        graphValidation.danglingConnectionElementIds.length > 0
      ) {
        return res.status(400).json({
          error: "Invalid boundary map graph",
          details: graphValidation,
        });
      }

      const completenessScore = Math.min(
        (elements.length / 4) * 50 + (connections.length / 6) * 50,
        100
      );

      const updated = await storage.updateProgress(sessionId, {
        boundaryMap: { elements, connections },
        assessmentScores: {
          boundaryMapCompleteness: completenessScore,
        },
      });

      if (!updated) return res.status(404).json({ error: "Session not found" });
      res.json({
        completeness: completenessScore,
        progress: updated,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.issues });
      }
      res.status(500).json({ error: "Failed to save boundary map" });
    }
  });

  app.post("/api/circuit", async (req, res) => {
    try {
      const validated = circuitRequestSchema.parse(req.body);
      const { sessionId, blocks, connections } = validated;

      const progress = await storage.getProgress(sessionId);
      if (!progress) {
        return res.status(404).json({ error: "Session not found" });
      }

      const graphValidation = validateCircuitGraph(blocks, connections);
      if (
        graphValidation.duplicateBlockIds.length > 0 ||
        graphValidation.duplicateConnectionIds.length > 0 ||
        graphValidation.danglingConnectionIds.length > 0 ||
        graphValidation.selfLoopConnectionIds.length > 0
      ) {
        return res.status(400).json({
          error: "Invalid circuit graph",
          details: graphValidation,
        });
      }

      const hasPerception = blocks.some((b) => b.type === "perception");
      const hasReasoning = blocks.some((b) => b.type === "reasoning");
      const hasExecution = blocks.some((b) => b.type === "execution");
      const isConnected = connections.length >= blocks.length - 1;

      const correctnessScore = 
        (hasPerception ? 25 : 0) +
        (hasReasoning ? 25 : 0) +
        (hasExecution ? 25 : 0) +
        (isConnected ? 25 : 0);

      const updated = await storage.updateProgress(sessionId, {
        circuit: { blocks, connections },
        assessmentScores: {
          circuitCorrectness: correctnessScore,
        },
      });

      if (!updated) return res.status(404).json({ error: "Session not found" });
      res.json({
        correctness: correctnessScore,
        progress: updated,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.issues });
      }
      res.status(500).json({ error: "Failed to save circuit" });
    }
  });

  app.post("/api/simulate", async (req, res) => {
    try {
      const validated = simulateRequestSchema.parse(req.body);
      const { sessionId, blockIds, fixtureId, failureConfig = {} } = validated;

      const progress = await storage.getProgress(sessionId);
      if (!progress) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Create block registry for easy lookup
      const blockRegistry = new Map<string, Block>();
      ALL_BLOCKS.forEach(block => blockRegistry.set(block.id, block));

      // Build pipeline from block IDs
      const selectedBlocks: Record<Process, Block | undefined> = {
        perception: blockRegistry.get(blockIds.perception),
        reasoning: blockRegistry.get(blockIds.reasoning),
        planning: blockRegistry.get(blockIds.planning),
        execution: blockRegistry.get(blockIds.execution),
      };

      // Verify all blocks were found
      const missingBlocks = Object.entries(selectedBlocks)
        .filter(([_, block]) => !block)
        .map(([process]) => process);
      
      if (missingBlocks.length > 0) {
        return res.status(400).json({ 
          error: "Invalid block IDs", 
          missingBlocks 
        });
      }

      const mismatchedBlocks = (Object.entries(selectedBlocks) as Array<[Process, Block]>)
        .filter(([process, block]) => block.kind !== process)
        .map(([process, block]) => ({
          process,
          blockId: block.id,
          blockKind: block.kind,
        }));

      if (mismatchedBlocks.length > 0) {
        return res.status(400).json({
          error: "Block IDs do not match required process slots",
          mismatchedBlocks,
        });
      }

      const pipeline: Record<Process, Block> = {
        perception: selectedBlocks.perception as Block,
        reasoning: selectedBlocks.reasoning as Block,
        planning: selectedBlocks.planning as Block,
        execution: selectedBlocks.execution as Block,
      };

      // Get fixture data
      const fixture = FIXTURES.find((candidate) => candidate.id === fixtureId);
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
        blockId: logEntry.step,
        timestamp: logEntry.timestamp,
        input: index > 0 ? result.log[index - 1].data : fixture.input,
        output: logEntry.data,
        status: logEntry.step.includes('ERROR') ? ('error' as const) : ('success' as const),
        message: logEntry.step,
      }));

      // Save to storage
      const updated = await storage.updateProgress(sessionId, {
        simulationResults: steps,
      });

      if (!updated) return res.status(404).json({ error: "Session not found" });
      res.json({ 
        steps,
        success: result.success,
        finalState: result.state,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.issues });
      }
      console.error('Simulation request failed');
      res.status(500).json({ error: "Failed to run simulation" });
    }
  });

  const createSessionHandler = async (_req: Request, res: Response) => {
    try {
      const sessionId = `session-${randomUUID()}`;
      
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

      res.setHeader("Cache-Control", "no-store");
      res.json({ sessionId, progress: initialProgress });
    } catch (error) {
      if (error instanceof SessionCapacityError) {
        res.setHeader("Retry-After", "60");
        return res.status(503).json({ error: "Session capacity reached. Please try again later." });
      }
      res.status(500).json({ error: "Failed to create session" });
    }
  };

  app.post("/api/session/create", rateLimit(120), async (req, res) => createSessionHandler(req, res));
  app.get("/api/session/create", (_req, res) => {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Use POST to create a session" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
