import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { contractDocuments } from "../db/schema";

export const getContractDocument = async (contractId: string) => {
  const document = await db
    .select()
    .from(contractDocuments)
    .where(eq(contractDocuments.contractId, contractId))
    .limit(1);
  return document.length ? document[0] : null;
};
