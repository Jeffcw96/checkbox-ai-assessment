import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { contractDocuments } from "../db/schema";

export const getContractDocuments = async (contractId: string) => {
  const document = await db
    .select()
    .from(contractDocuments)
    .where(eq(contractDocuments.contractId, contractId));
  return document.length ? document : [];
};
