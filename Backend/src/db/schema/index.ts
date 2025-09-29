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

export const users = pgTable("matter_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  picture: text("picture"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const contracts = pgTable(
  "contracts",
  {
    id: text("id").notNull().unique().primaryKey(),
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
    idxRequester: index("idx_contracts_requester_id").on(t.requesterId),
    idxAssignee: index("idx_contracts_assignee_id").on(t.assigneeId),
  })
);

export const contractStatusHistory = pgTable(
  "contract_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contractId: text("contract_id")
      .notNull()
      .references(() => contracts.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    changedAt: timestamp("changed_at", { mode: "string" }).defaultNow(),
  },
  (t) => ({
    idxcontract: index("idx_contract_status_history_contract_id").on(
      t.contractId
    ),
  })
);

export const contractComments = pgTable(
  "contract_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contractId: text("contract_id")
      .notNull()
      .references(() => contracts.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  (t) => ({
    idxcontract: index("idx_contract_comments_contract_id").on(t.contractId),
    idxAuthor: index("idx_contract_comments_author_id").on(t.authorId),
  })
);

export const contractDocuments = pgTable(
  "contract_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contractId: text("contract_id")
      .notNull()
      .references(() => contracts.id, { onDelete: "cascade" }),
    documentId: text("document_id").notNull(),
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (t) => ({
    idxcontract: index("idx_contract_documents_contract_id").on(t.contractId),
    idxDocument: index("idx_contract_documents_document_id").on(t.documentId),
  })
);

export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: text("event_id").notNull().unique(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});
