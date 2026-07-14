import app from "./app";
import { logger } from "./lib/logger";
import { createServer } from "node:http";
import { initRealtime } from "./realtime/hub.js";
import { prisma } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function connectDbWithRetry(opts: { timeoutMs: number; intervalMs: number }) {
  const deadline = Date.now() + opts.timeoutMs;
  let attempt = 0;
  while (true) {
    attempt += 1;
    try {
      await prisma.$connect();
      return;
    } catch (err) {
      const remaining = deadline - Date.now();
      logger.warn(
        {
          attempt,
          remainingMs: Math.max(0, remaining),
          err,
        },
        "Database connection failed; retrying",
      );
      if (remaining <= 0) throw err;
      await new Promise((r) => setTimeout(r, opts.intervalMs));
    }
  }
}

const server = createServer(app);
initRealtime(server);

server.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});

connectDbWithRetry({ timeoutMs: 30_000, intervalMs: 1_000 })
  .then(() => {
    server.listen(port, () => {
      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.error({ err }, "Failed to connect to database; exiting");
    process.exit(1);
  });
