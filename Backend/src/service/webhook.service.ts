import { ContractCreatedSchema } from "../type/schema/contract.type";

export const getEventRouter = (): Record<
  string,
  (payload?: any) => Promise<void>
> => {
  return {
    "contract.created": async (payload: any) => {
      console.log("Handling contract.created event");
      // Add your logic here
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

  try {
  } catch (error) {}

  // Save matterDetails to the database
  // Save comments and documents to their respective tables, linking them to the new matter
};
