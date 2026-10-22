import type { RequestHandler } from "express";

export function allowedDevelopmentHost(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(`http://${value}`);
    if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) return false;
    const hostname = parsed.hostname.toLowerCase();
    const configured = [process.env.REPLIT_DOMAINS, process.env.DEV_ALLOWED_HOSTS]
      .flatMap((hosts) => hosts?.split(",").map((host) => host.trim().toLowerCase()) ?? []);
    return ["localhost", "127.0.0.1", "[::1]", ...configured].includes(hostname);
  } catch {
    return false;
  }
}

export const guardDevelopmentHost: RequestHandler = (req, res, next) => {
  if (process.env.NODE_ENV !== "production" && !allowedDevelopmentHost(req.get("Host"))) {
    res.status(403).end("Host not allowed");
    return;
  }
  next();
};

export const securityHeaders: RequestHandler = (_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000");
    res.setHeader("Content-Security-Policy", [
      "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com", "img-src 'self' data:", "connect-src 'self'",
      "object-src 'none'", "base-uri 'none'", "frame-ancestors 'none'", "form-action 'self'",
    ].join("; "));
  }
  next();
};

// Bound both request counts and limiter state; forwarded IPs are intentionally not trusted.
export function rateLimit(limit: number, windowMs = 60_000): RequestHandler {
  const windows = new Map<string, { count: number; expires: number }>();
  return (req, res, next) => {
    const now = Date.now();
    for (const [key, entry] of windows) {
      if (entry.expires <= now) windows.delete(key);
    }
    const key = req.socket.remoteAddress ?? "unknown";
    let entry = windows.get(key);
    if (!entry) {
      if (windows.size >= 4096) {
        res.setHeader("Retry-After", "60");
        res.status(429).json({ error: "Too many requests" });
        return;
      }
      entry = { count: 0, expires: now + windowMs };
      windows.set(key, entry);
    }
    if (++entry.count > limit) {
      res.setHeader("Retry-After", String(Math.ceil((entry.expires - now) / 1000)));
      res.status(429).json({ error: "Too many requests" });
      return;
    }
    next();
  };
}

export const guardApiRequest: RequestHandler = (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.get("Content-Encoding") && req.get("Content-Encoding") !== "identity") {
    res.status(415).json({ error: "Compressed requests are not supported" });
    return;
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    if (req.get("Sec-Fetch-Site") === "cross-site" || req.get("X-Requested-With") !== "AgentLearning") {
      res.status(403).json({ error: "Same-origin API request required" });
      return;
    }
    if ((Number(req.get("Content-Length") ?? 0) > 0 || req.get("Transfer-Encoding")) && !req.is("application/json")) {
      res.status(415).json({ error: "JSON request required" });
      return;
    }
  }
  next();
};
