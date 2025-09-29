import { ContractCreatedSchema } from "../type/schema/contract.type";
import { UserMatterRole } from "../type/schema/user.type";
import { db } from "../utils/database";

// Minimal mock payload for insert_contract RPC
export const mockInsertContractPayload = {
  event: "contract.created",
  status: "draft", // used by matter_history insert (payload->>'status')
  contract: {
    id: "ctr_min_001",
    title: "NDA - Vendor",
    status: "draft",
    requester_id: "usr_req_001",
    assignee_id: "usr_assignee_002",
    comments: [
      {
        author_id: "usr_req_001",
        message: "Please review ASAP.",
        createdAt: new Date().toISOString(),
      },
      {
        author_id: "usr_assignee_002",
        message: "Acknowledged. Will revert today.",
        createdAt: new Date().toISOString(),
      },
    ],
    documents: [
      {
        id: "doc_min_001",
        name: "NDA_Draft.pdf",
        url: "https://example.com/contracts/ctr_min_001/NDA_Draft.pdf",
      },
    ],
  },
};

// Optional: validate if schema still accepts minimal shape (may fail if schema requires extra fields)
const _mockValidationCheck = ContractCreatedSchema.safeParse(
  mockInsertContractPayload
);
if (!_mockValidationCheck.success) {
  // eslint-disable-next-line no-console
  console.warn(
    "Minimal mock failed ContractCreatedSchema validation (adjust schema or enrich payload)."
  );
}

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
      // Add your logic here
    },
    "contract.deleted": async (payload: any) => {
      console.log("Handling contract.deleted event");
      // Add your logic here
    },
    "contract.status_updated": async (payload: any) => {
      console.log("Handling contract.status_updated event");
      // Add your logic here
    },
    "contract.comment_added": async (payload: any) => {
      console.log("Handling contract.comment_added event");
      // Add your logic here
    },
  };
};

export const handleNewMatterCreation = async (payload: any) => {
  // Logic to create a new matter in the system
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

  const { data, error } = await db.rpc("insert_contract", {
    eventId: parsed.data.eventId,
    contractId: matterDetails.id,
    title: matterDetails.title,
    description: matterDetails.description,
    status: matterDetails.status,
    requesterId,
    assigneeId,
    comments,
    documents,
  });

  if (error) {
    console.error("Error inserting contract:", error);
    return { isValid: false, error: error.message };
  }

  return { isValid: true, data };

  // Save matterDetails to the database
  // Save comments and documents to their respective tables, linking them to the new matter
};
