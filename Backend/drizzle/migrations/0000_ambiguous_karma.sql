CREATE TABLE "contract_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" text NOT NULL,
	"author_id" uuid NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" text NOT NULL,
	"document_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" text NOT NULL,
	"status" text NOT NULL,
	"changed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" text PRIMARY KEY NOT NULL,
	"requester_id" uuid,
	"assignee_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"status" text NOT NULL,
	"rank" numeric(30, 10),
	"version" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "contracts_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "matter_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"picture" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "matter_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "webhook_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
ALTER TABLE "contract_comments" ADD CONSTRAINT "contract_comments_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_comments" ADD CONSTRAINT "contract_comments_author_id_matter_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."matter_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_documents" ADD CONSTRAINT "contract_documents_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_status_history" ADD CONSTRAINT "contract_status_history_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_requester_id_matter_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."matter_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_assignee_id_matter_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."matter_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_contract_comments_contract_id" ON "contract_comments" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "idx_contract_comments_author_id" ON "contract_comments" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_contract_documents_contract_id" ON "contract_documents" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "idx_contract_documents_document_id" ON "contract_documents" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "idx_contract_status_history_contract_id" ON "contract_status_history" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "idx_contracts_requester_id" ON "contracts" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "idx_contracts_assignee_id" ON "contracts" USING btree ("assignee_id");