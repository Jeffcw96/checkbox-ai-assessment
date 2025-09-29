import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { contractComments, contracts, webhookEvents } from "../db/schema";
import { CommentAddedSchema } from "../type/schema/comment.type";

export const handleContractCommentAdded = async (payload: any) => {
  console.log("Adding contract comment with data:", payload);

  const parsed = CommentAddedSchema.safeParse(payload);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
      code: i.code,
    }));
    return {
      isValid: false,
      error: JSON.stringify({ event: payload?.event, issues }),
    };
  }

  const { event, eventId, contractId, comment } = parsed.data;

  const [existingEvent, contract] = await Promise.all([
    db
      .select({ id: webhookEvents.id })
      .from(webhookEvents)
      .where(eq(webhookEvents.eventId, eventId))
      .limit(1),
    db
      .select({ id: contracts.id })
      .from(contracts)
      .where(eq(contracts.id, contractId))
      .limit(1),
  ]);

  if (existingEvent.length) {
    return {
      isValid: true,
      data: { skipped: true, reason: "event_already_processed" },
    };
  }

  if (!contract.length) {
    return { skipped: true, reason: "contract_not_found" };
  }

  const result = await db.transaction(async (tx) => {
    await tx.insert(contractComments).values({
      contractId,
      authorId: comment.author,
      message: comment.message,
      createdAt: comment.createdAt,
      updatedAt: comment.createdAt,
    });

    await tx.insert(webhookEvents).values({
      eventId,
      eventType: event,
      payload,
    });

    return { skipped: false, contractId };
  });

  return { isValid: true, data: result };
};
