import { eq } from "drizzle-orm";
import { db } from "../db/client";
import {
  contractComments,
  contractDocuments,
  contracts,
  contractStatusHistory,
  webhookEvents,
} from "../db/schema";
import { ContractCreatedSchema } from "../type/schema/contract.type";
import { UserContractRole } from "../type/schema/user.type";

export const handleNewContractCreation = async (payload: any) => {
  console.log("Creating new contract with data:", payload);
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

  const { comments, documents, ...contractDetails } = parsed.data.contract;

  const requesterId = contractDetails.users.find(
    (user) => user.role.toUpperCase() === UserContractRole.REQUESTER
  )?.id;

  const assigneeId = contractDetails.users.find(
    (user) => user.role.toUpperCase() === UserContractRole.ASSIGNEE
  )?.id;

  const result = await db.transaction(async (tx) => {
    // Upsert webhook event first for idempotency
    const eventId = parsed.data.eventId ?? `evt_${contractDetails.id}`;
    const existing = await tx
      .select({ id: webhookEvents.id })
      .from(webhookEvents)
      .where(eq(webhookEvents.eventId, eventId))
      .limit(1);
    if (existing.length) {
      return { skipped: true, reason: "event_already_processed" };
    }

    const insertedcontract = await tx
      .insert(contracts)
      .values({
        id: contractDetails.id,
        title: contractDetails.title,
        description: contractDetails.description,
        status: contractDetails.status,
        requesterId,
        assigneeId,
      })
      .returning({ id: contracts.id });

    const contractId = insertedcontract[0].id;

    if (comments?.length) {
      await tx.insert(contractComments).values(
        comments.map((c) => ({
          contractId,
          authorId: (c as any).author ?? (c as any).author_id,
          message: c.message,
        }))
      );
    }

    if (documents?.length) {
      await tx.insert(contractDocuments).values(
        documents.map((d) => ({
          contractId,
          documentId: d.id,
          fileName: d.name,
          fileUrl: d.url,
        }))
      );
    }

    await tx.insert(contractStatusHistory).values({
      contractId,
      status: contractDetails.status,
    });

    await tx.insert(webhookEvents).values({
      eventId,
      eventType: parsed.data.event,
      payload,
    });

    return { skipped: false, contractId };
  });

  return { isValid: true, data: result };
};
