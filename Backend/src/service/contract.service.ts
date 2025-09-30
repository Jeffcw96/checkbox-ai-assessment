import { desc, eq, SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../db/client";
import {
  contractComments,
  contractDocuments,
  contracts,
  contractStatusHistory,
  users,
  webhookEvents,
} from "../db/schema";
import {
  ContractCreatedSchema,
  ContractStatusUpdatedSchema,
} from "../type/schema/contract.type";
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
          createdAt: c.createdAt,
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
      changedAt: contractDetails.createdAt,
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

export const handleContractStatusUpdate = async (payload: any) => {
  console.log("Updating contract status with data:", payload);

  const parsed = ContractStatusUpdatedSchema.safeParse(payload);
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

  const { event, eventId, contractId, status, updatedAt } = parsed.data;

  // Idempotency check
  const existing = await db
    .select({ id: webhookEvents.id })
    .from(webhookEvents)
    .where(eq(webhookEvents.eventId, eventId ?? ""))
    .limit(1);

  if (existing.length) {
    return { skipped: true, reason: "event_already_processed" };
  }

  const result = await db.transaction(async (tx) => {
    // Update contract (ensure it exists)
    const updated = await tx
      .update(contracts)
      .set({
        status,
        updatedAt,
      })
      .where(eq(contracts.id, contractId))
      .returning({ id: contracts.id });

    if (!updated.length) {
      return { skipped: true, reason: "contract_not_found" };
    }

    // Insert status history
    await tx.insert(contractStatusHistory).values({
      contractId,
      status,
      changedAt: updatedAt,
    });

    // Record webhook event
    await tx.insert(webhookEvents).values({
      eventId,
      eventType: event,
      payload,
    });

    return { skipped: false, contractId };
  });

  return { isValid: true, data: result };
};

export const getContracts = async () => {
  const requester = alias(users, "requester");
  const assignee = alias(users, "assignee");

  const contractsList = await db
    .select({
      id: contracts.id,
      title: contracts.title,
      description: contracts.description,
      status: contracts.status,
      rank: contracts.rank,
      version: contracts.version,
      requester: {
        id: requester.id,
        name: requester.name,
        image: requester.picture,
      },
      assignee: {
        id: assignee.id,
        name: assignee.name,
        image: assignee.picture,
      },
      createdAt: contracts.createdAt,
      updatedAt: contracts.updatedAt,
    })
    .from(contracts)
    .leftJoin(requester, eq(requester.id, contracts.requesterId))
    .leftJoin(assignee, eq(assignee.id, contracts.assigneeId));

  return contractsList;
};

export const getContractById = async (contractId: string) => {
  const requester = alias(users, "requester");
  const assignee = alias(users, "assignee");

  const contract = await db
    .select({
      id: contracts.id,
      title: contracts.title,
      description: contracts.description,
      status: contracts.status,
      rank: contracts.rank,
      version: contracts.version,
      requester: {
        id: requester.id,
        name: requester.name,
        image: requester.picture,
      },
      assignee: {
        id: assignee.id,
        name: assignee.name,
        image: assignee.picture,
      },
      createdAt: contracts.createdAt,
      updatedAt: contracts.updatedAt,
    })
    .from(contracts)
    .leftJoin(requester, eq(requester.id, contracts.requesterId))
    .leftJoin(assignee, eq(assignee.id, contracts.assigneeId))
    .where(eq(contracts.id, contractId))
    .limit(1)
    .then((res) => res[0]);

  return contract;
};
function leftJoin(requester: any, arg1: SQL<unknown>) {
  throw new Error("Function not implemented.");
}
