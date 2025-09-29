import { eq } from "drizzle-orm";
import { db as drizzleDb } from "../db/client";
import {
  matterComments,
  matterDocuments,
  matters,
  matterStatusHistory,
  webhookEvents,
} from "../db/schema";
import { ContractCreatedSchema } from "../type/schema/contract.type";
import { UserMatterRole } from "../type/schema/user.type";

export const getEventRouter = (): Record<
  string,
  (payload?: any) => Promise<any>
> => {
  return {
    "contract.created": async (payload: any) => {
      console.log("Handling contract.created event", payload.eventId);
      return await handleNewMatterCreation(payload);
    },
    "contract.updated": async (payload: any) => {
      console.log("Handling contract.updated event");
    },
    "contract.deleted": async (payload: any) => {
      console.log("Handling contract.deleted event");
    },
    "contract.status_updated": async (payload: any) => {
      console.log("Handling contract.status_updated event");
    },
    "contract.comment_added": async (payload: any) => {
      console.log("Handling contract.comment_added event");
    },
  };
};

export const handleNewMatterCreation = async (payload: any) => {
  console.log("Creating new matter with data:", payload);
  // Extract comments and documents field

  const parsed = ContractCreatedSchema.safeParse(payload);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
      code: i.code,
    }));
    return {
      isValid: false,
      error: JSON.stringify({ event: payload.event, issues }),
    };
  }

  const { comments, documents, ...matterDetails } = parsed.data.contract;

  const requesterId = matterDetails.users.find(
    (user) => user.role.toUpperCase() === UserMatterRole.REQUESTER
  )?.id;

  const assigneeId = matterDetails.users.find(
    (user) => user.role.toUpperCase() === UserMatterRole.ASSIGNEE
  )?.id;

  const result = await drizzleDb.transaction(async (tx) => {
    // Upsert webhook event first for idempotency
    const eventId = parsed.data.eventId ?? `evt_${matterDetails.id}`;
    const existing = await tx
      .select({ id: webhookEvents.id })
      .from(webhookEvents)
      .where(eq(webhookEvents.eventId, eventId))
      .limit(1);
    if (existing.length) {
      return { skipped: true, reason: "event_already_processed" };
    }

    const insertedMatter = await tx
      .insert(matters)
      .values({
        contractId: matterDetails.id,
        title: matterDetails.title,
        description: matterDetails.description,
        status: matterDetails.status,
        requesterId,
        assigneeId,
      })
      .returning({ id: matters.id });

    const matterId = insertedMatter[0].id;

    if (comments?.length) {
      await tx.insert(matterComments).values(
        comments.map((c) => ({
          matterId,
          authorId: (c as any).author ?? (c as any).author_id, // schema vs sample mismatch
          message: c.message,
          // created_at default handled by DB
        }))
      );
    }

    if (documents?.length) {
      await tx.insert(matterDocuments).values(
        documents.map((d) => ({
          matterId,
          documentId: d.id,
          fileName: d.name,
          fileUrl: d.url,
        }))
      );
    }

    await tx.insert(matterStatusHistory).values({
      matterId,
      status: matterDetails.status,
    });

    await tx.insert(webhookEvents).values({
      eventId,
      eventType: parsed.data.event,
      payload,
    });

    return { skipped: false, matterId };
  });

  return { isValid: true, data: result };
};
