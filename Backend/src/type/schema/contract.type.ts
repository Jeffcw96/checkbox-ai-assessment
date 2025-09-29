import { z } from "zod";
import { CommentSchema } from "./comment.type";
import { DocumentSchema } from "./document.type";
import { UserSchema } from "./user.type";

export const ContractStatus = z.enum(["Draft", "In Review", "Done"]);

export const ContractCreatedSchema = z.object({
  event: z.literal("contract.created"),
  contract: z.object({
    id: z.string(),
    title: z.string(),
    status: ContractStatus,
    createdAt: z.string(),
    comments: z.array(CommentSchema).optional(),
    users: z.array(UserSchema),
    documents: z.array(DocumentSchema).optional(),
  }),
});

export const ContractStatusUpdatedSchema = z.object({
  event: z.literal("contract.status_updated"),
  contractId: z.string(),
  status: ContractStatus,
  updatedAt: z.string(),
});

export type ContractStatusType = z.infer<typeof ContractStatus>;
export type ContractStatusUpdatedSchemaType = z.infer<
  typeof ContractStatusUpdatedSchema
>;
export type ContractCreatedSchemaType = z.infer<typeof ContractCreatedSchema>;
