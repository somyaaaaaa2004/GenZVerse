import { prisma } from "@workspace/db";
import type { Prisma } from "@prisma/client";

export async function createAuditLog(data: {
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.auditLog.create({ data });
}

export async function createSystemLog(
  level: string,
  message: string,
  context?: Prisma.InputJsonValue,
) {
  return prisma.systemLog.create({
    data: { level, message, context },
  });
}
