CREATE TABLE "file" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"name" text NOT NULL,
	"repository_id" integer,
	"parent_id" integer,
	"creator_id" integer,
	CONSTRAINT "file_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "file_repository_id_parent_id_name_unique" UNIQUE("repository_id","parent_id","name")
);
--> statement-breakpoint
CREATE TABLE "file_metadata" (
	"file_id" integer NOT NULL,
	"mime_type" text NOT NULL,
	"sha256" varchar(64) NOT NULL,
	"size" integer NOT NULL,
	"birthtime" timestamp NOT NULL,
	"mtime" timestamp NOT NULL,
	CONSTRAINT "file_metadata_file_id_unique" UNIQUE("file_id")
);
--> statement-breakpoint
CREATE TABLE "folder" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"name" text NOT NULL,
	"repository_id" integer,
	"parent_id" integer,
	"creator_id" integer,
	CONSTRAINT "folder_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "folder_repository_id_parent_id_name_unique" UNIQUE("repository_id","parent_id","name")
);
--> statement-breakpoint
CREATE TABLE "folder_metadata" (
	"folder_id" integer NOT NULL,
	"file_count" integer DEFAULT 0,
	"folder_count" integer DEFAULT 0,
	"birthtime" timestamp NOT NULL,
	"mtime" timestamp NOT NULL,
	CONSTRAINT "folder_metadata_folder_id_unique" UNIQUE("folder_id")
);
--> statement-breakpoint
CREATE TABLE "repository" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"path" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"modified_at" timestamp DEFAULT now(),
	"creator_id" integer,
	"linked_folder_id" integer,
	CONSTRAINT "repository_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "repository_path_unique" UNIQUE("path"),
	CONSTRAINT "repository_name_unique" UNIQUE("name"),
	CONSTRAINT "repository_linked_folder_id_unique" UNIQUE("linked_folder_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"modified_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false,
	CONSTRAINT "user_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "visible_repository" (
	"user_id" integer,
	"repository_id" integer,
	"created_at" timestamp DEFAULT now(),
	"modified_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_repository_id_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repository"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_parent_id_folder_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_metadata" ADD CONSTRAINT "file_metadata_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder" ADD CONSTRAINT "folder_repository_id_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repository"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder" ADD CONSTRAINT "folder_parent_id_folder_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder" ADD CONSTRAINT "folder_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder_metadata" ADD CONSTRAINT "folder_metadata_folder_id_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository" ADD CONSTRAINT "repository_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository" ADD CONSTRAINT "repository_linked_folder_id_folder_id_fk" FOREIGN KEY ("linked_folder_id") REFERENCES "public"."folder"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visible_repository" ADD CONSTRAINT "visible_repository_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visible_repository" ADD CONSTRAINT "visible_repository_repository_id_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repository"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "file_uuid_name_idx" ON "file" USING btree ("uuid","name");--> statement-breakpoint
CREATE UNIQUE INDEX "sha256_mime_idx" ON "file_metadata" USING btree ("sha256","mime_type");--> statement-breakpoint
CREATE UNIQUE INDEX "folder_uuid_name_idx" ON "folder" USING btree ("uuid","name");--> statement-breakpoint
CREATE UNIQUE INDEX "repository_uuid_idx" ON "repository" USING btree ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "username_uuid_idx" ON "user" USING btree ("username","uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "repo_user_idx" ON "visible_repository" USING btree ("repository_id","user_id");