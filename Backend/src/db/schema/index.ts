import {
  bigint,
  index,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  picture: text("picture"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const matters = pgTable(
  "matters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contractId: text("contract_id").notNull(),
    requesterId: uuid("requester_id").references(() => users.id),
    assigneeId: uuid("assignee_id").references(() => users.id),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").notNull(),
    rank: numeric("rank", { precision: 30, scale: 10 }),
    version: bigint("version", { mode: "number" }).notNull().default(0),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  (t) => ({
    idxRequester: index("idx_matters_requester_id").on(t.requesterId),
    idxAssignee: index("idx_matters_assignee_id").on(t.assigneeId),
  })
);

export const matterStatusHistory = pgTable(
  "matter_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matterId: uuid("matter_id")
      .notNull()
      .references(() => matters.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    changedAt: timestamp("changed_at", { mode: "string" }).defaultNow(),
  },
  (t) => ({
    idxMatter: index("idx_matter_status_history_matter_id").on(t.matterId),
  })
);

export const matterComments = pgTable(
  "matter_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matterId: uuid("matter_id")
      .notNull()
      .references(() => matters.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  (t) => ({
    idxMatter: index("idx_matter_comments_matter_id").on(t.matterId),
    idxAuthor: index("idx_matter_comments_author_id").on(t.authorId),
  })
);

export const matterDocuments = pgTable(
  "matter_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matterId: uuid("matter_id")
      .notNull()
      .references(() => matters.id, { onDelete: "cascade" }),
    documentId: text("document_id").notNull(),
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (t) => ({
    idxMatter: index("idx_matter_documents_matter_id").on(t.matterId),
    idxDocument: index("idx_matter_documents_document_id").on(t.documentId),
  })
);

export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: text("event_id").notNull().unique(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});
