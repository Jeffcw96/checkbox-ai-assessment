import z from "zod";
import { CommentAddedSchema } from "../type/schema/comment.type";
import {
  ContractCreatedSchema,
  ContractStatusUpdatedSchema,
} from "../type/schema/contract.type";

export const eventSchemaMapper: Record<string, z.ZodTypeAny> = {
  "contract.created": ContractCreatedSchema,
  "contract.status_updated": ContractStatusUpdatedSchema,
  "contract.comment_added": CommentAddedSchema,
};
