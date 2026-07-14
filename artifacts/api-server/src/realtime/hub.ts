import { WebSocketServer, type WebSocket } from "ws";
import type { Server } from "node:http";
import jwt from "jsonwebtoken";
import { prisma } from "@workspace/db";
import { env } from "../config/env.js";
import type { AuthPayload } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";

type OutboundEvent =
  | { type: "social:friend_request"; payload: Record<string, unknown> }
  | { type: "social:friend_request_accepted"; payload: Record<string, unknown> }
  | { type: "social:notification"; payload: Record<string, unknown> }
  | { type: "presence:update"; payload: Record<string, unknown> };

const userSockets = new Map<string, Set<WebSocket>>();
let wss: WebSocketServer | null = null;

function sendSafe(ws: WebSocket, event: OutboundEvent) {
  if (ws.readyState !== ws.OPEN) return;
  ws.send(JSON.stringify(event));
}

function broadcastPresence(userId: string, status: string, lastSeenAt: Date | null) {
  const event: OutboundEvent = {
    type: "presence:update",
    payload: { userId, status, lastSeenAt: lastSeenAt?.toISOString() ?? null },
  };
  for (const sockets of userSockets.values()) {
    for (const ws of sockets) sendSafe(ws, event);
  }
}

async function setUserPresence(userId: string, status: "ONLINE" | "OFFLINE") {
  const lastSeenAt = status === "OFFLINE" ? new Date() : null;
  await prisma.user.update({
    where: { id: userId },
    data: { presenceStatus: status, lastSeenAt },
  });
  broadcastPresence(userId, status, lastSeenAt);
}

function parseUserIdFromRequest(req: Parameters<WebSocketServer["handleUpgrade"]>[0]): string | null {
  try {
    const url = new URL(req.url ?? "", "http://localhost");
    const token = url.searchParams.get("token");
    if (!token) return null;
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    if (payload.type !== "access") return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export function initRealtime(server: Server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", async (ws, req) => {
    const userId = parseUserIdFromRequest(req);
    if (!userId) {
      ws.close(1008, "Unauthorized");
      return;
    }

    const sockets = userSockets.get(userId) ?? new Set<WebSocket>();
    sockets.add(ws);
    userSockets.set(userId, sockets);

    try {
      await setUserPresence(userId, "ONLINE");
    } catch (error) {
      logger.warn({ err: error, userId }, "Failed to set user online");
    }

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString()) as {
          type?: string;
          payload?: Record<string, unknown>;
        };
        if (data.type === "presence:set") {
          const status = data.payload?.status;
          if (
            status === "ONLINE" ||
            status === "AWAY" ||
            status === "BUSY" ||
            status === "INVISIBLE" ||
            status === "OFFLINE"
          ) {
            const lastSeenAt = status === "OFFLINE" ? new Date() : null;
            await prisma.user.update({
              where: { id: userId },
              data: { presenceStatus: status, lastSeenAt },
            });
            broadcastPresence(userId, status, lastSeenAt);
          }
        }
      } catch {
        // ignore malformed realtime messages
      }
    });

    ws.on("close", async () => {
      const current = userSockets.get(userId);
      if (!current) return;
      current.delete(ws);
      if (current.size === 0) {
        userSockets.delete(userId);
        try {
          await setUserPresence(userId, "OFFLINE");
        } catch (error) {
          logger.warn({ err: error, userId }, "Failed to set user offline");
        }
      }
    });
  });

  logger.info("Realtime WebSocket hub initialized");
}

export function emitToUser(userId: string, event: OutboundEvent) {
  const sockets = userSockets.get(userId);
  if (!sockets) return;
  for (const ws of sockets) sendSafe(ws, event);
}

