import { z } from "zod";

export const DocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
});

export type DocumentSchemaType = z.infer<typeof DocumentSchema>;
