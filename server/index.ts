import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { securityHeaders, guardApiRequest, rateLimit, guardDevelopmentHost } from "./security";
import { initializeStorage, closeStorage } from "./storageProvider";

const [nodeMajor, nodeMinor, nodePatch] = process.versions.node.split(".").map(Number);
if (nodeMajor !== 24 || nodeMinor < 22 || (nodeMinor === 22 && nodePatch < 1)) {
  throw new Error("Node 24.22.1 or a newer Node 24 security release is required");
}

const app = express();
app.disable("x-powered-by");
app.set("query parser", "simple");
app.use(securityHeaders);
app.use(guardDevelopmentHost);
app.use("/api", rateLimit(600), guardApiRequest);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  limit: "128kb",
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      // Never log query strings, session IDs, learner text, or API response bodies.
      log(`${req.method} ${req.route?.path ?? "/api"} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  await initializeStorage();
  const server = await registerRoutes(app);
  app.use("/api/*", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const reportedStatus = err.status || err.statusCode;
    const status = Number.isInteger(reportedStatus) && reportedStatus >= 400 && reportedStatus <= 599 ? reportedStatus : 500;
    const message = status === 413 ? "Request too large" : status < 500 ? "Invalid request" : "Internal Server Error";
    if (res.headersSent) return _next(err);
    log(`request error ${status}`, "express");
    res.status(status).json({ message });
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  server.keepAliveTimeout = 5_000;
  server.maxRequestsPerSocket = 1000;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    const address = server.address();
    log(`runtime Node ${process.versions.node}; OpenSSL ${process.versions.openssl}`);
    log(`serving on port ${typeof address === "object" && address ? address.port : port}`);
  });
  const shutdown = () => {
    const deadline = setTimeout(() => process.exit(1), 10_000);
    deadline.unref();
    server.close(() => {
      void closeStorage().finally(() => clearTimeout(deadline));
    });
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
})().catch(async () => {
  console.error("Application startup failed; verify runtime and database configuration");
  await closeStorage();
  process.exitCode = 1;
});
