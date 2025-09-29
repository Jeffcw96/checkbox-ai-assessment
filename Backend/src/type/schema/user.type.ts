import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
});

export type UserSchemaType = z.infer<typeof UserSchema>;

export enum UserContractRole {
  REQUESTER = "REQUESTER",
  ASSIGNEE = "ASSIGNEE",
}
