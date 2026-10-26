import type { RequestHandler } from "express";

export function createReadinessHandler(
  check: () => Promise<void>,
  report: (ready: boolean) => void,
  now: () => number = () => performance.now(),
) {
  let draining = false;
  let lastReady: boolean | undefined;
  let expires = 0;
  let pending: Promise<boolean> | undefined;

  const handler: RequestHandler = async (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (!draining && (!pending || now() >= expires)) {
      // Coalesce probes, including failures, to protect the database pool.
      // Start the short cache lifetime only after the query settles.
      expires = Infinity;
      pending = Promise.resolve().then(check).then(() => true, () => false).then((ready) => {
        expires = now() + 5000;
        if (!draining && ready !== lastReady) {
          lastReady = ready;
          report(ready);
        }
        return ready;
      });
    }
    const ready = !draining && await pending;
    if (draining || !ready) {
      res.setHeader("Retry-After", "5");
      res.status(503).json({ status: "unavailable" });
    } else {
      res.json({ status: "ok" });
    }
  };

  return { handler, drain: () => {
    draining = true;
    if (lastReady !== false) {
      lastReady = false;
      report(false);
    }
  } };
}
