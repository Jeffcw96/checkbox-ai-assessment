import { z } from "zod";

export const CommentSchema = z.object({
  id: z.string(),
  author: z.string(),
  message: z.string(),
  createdAt: z.string().datetime(),
});

export const CommentAddedSchema = z.object({
  event: z.literal("contract.comment_added"),
  eventId: z.string(),
  contractId: z.string(),
  comment: CommentSchema,
});

export type CommentAddedSchemaType = z.infer<typeof CommentAddedSchema>;

export type CommentSchemaType = z.infer<typeof CommentSchema>;
