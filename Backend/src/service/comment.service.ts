import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import {
  contractComments,
  contracts,
  users,
  webhookEvents,
} from "../db/schema";
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

export const getContractComments = async (contractId: string) => {
  const rows = await db
    .select({
      id: contractComments.id,
      contractId: contractComments.contractId,
      authorId: contractComments.authorId,
      message: contractComments.message,
      createdAt: contractComments.createdAt,
      updatedAt: contractComments.updatedAt,
      authorName: users.name,
      authorPicture: users.picture,
    })
    .from(contractComments)
    .leftJoin(users, eq(users.id, contractComments.authorId))
    .where(eq(contractComments.contractId, contractId))
    .orderBy(desc(contractComments.createdAt));

  return rows.map((r) => ({
    id: r.id,
    contractId: r.contractId,
    message: r.message,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    author: {
      id: r.authorId,
      name: r.authorName,
      image: r.authorPicture,
    },
  }));
};
