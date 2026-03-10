import { prisma } from "../lib/prisma";
import { AuditEvent } from "../prisma/generated/prisma/enums";

export default async function logAudit(
  userId: string,
  event: AuditEvent,
  description?: string,
  entityId?: string,
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId,
        event: event,
        description: description ?? null,
        entityId: entityId ?? null,
      },
    });
  } catch (error) {
    console.error(`Failed to log audit: ${error}`);
  }
}
