import { handleContractCommentAdded } from "./comment.service";
import {
  handleContractStatusUpdate,
  handleNewContractCreation,
} from "./contract.service";

export const getEventRouter = (): Record<
  string,
  (payload?: any) => Promise<any>
> => {
  return {
    "contract.created": async (payload: any) => {
      return await handleNewContractCreation(payload);
    },
    "contract.updated": async (payload: any) => {
      console.log("Handling contract.updated event");
    },
    "contract.deleted": async (payload: any) => {
      console.log("Handling contract.deleted event");
    },
    "contract.status_updated": async (payload: any) => {
      return await handleContractStatusUpdate(payload);
    },
    "contract.comment_added": async (payload: any) => {
      return await handleContractCommentAdded(payload);
    },
  };
};
