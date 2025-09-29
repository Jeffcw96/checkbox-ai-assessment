import { handleNewContractCreation } from "./contract.service";

export const getEventRouter = (): Record<
  string,
  (payload?: any) => Promise<any>
> => {
  return {
    "contract.created": async (payload: any) => {
      console.log("Handling contract.created event", payload.eventId);
      return await handleNewContractCreation(payload);
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
