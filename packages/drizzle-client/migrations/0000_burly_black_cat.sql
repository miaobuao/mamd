CREATE TABLE "file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"full_path" text NOT NULL,
	"repository_id" uuid NOT NULL,
	"parent_id" uuid,
	"creator_id" uuid,
	CONSTRAINT "file_repositoryId_fullPath_unique" UNIQUE("repository_id","full_path")
);
--> statement-breakpoint
CREATE TABLE "file_metadata" (
	"file_id" uuid PRIMARY KEY NOT NULL,
	"mime_type" text NOT NULL,
	"sha256" varchar(64) NOT NULL,
	"size" bigint NOT NULL,
	"birthtime" timestamp NOT NULL,
	"mtime" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "folder" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"full_path" text NOT NULL,
	"repository_id" uuid NOT NULL,
	"parent_id" uuid,
	"creator_id" uuid,
	CONSTRAINT "folder_repositoryId_fullPath_unique" UNIQUE("repository_id","full_path")
);
--> statement-breakpoint
CREATE TABLE "repository" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"creator_id" uuid NOT NULL,
	"linked_folder_id" uuid,
	"ctime" timestamp DEFAULT now() NOT NULL,
	"mtime" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"ctime" timestamp DEFAULT now() NOT NULL,
	"mtime" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "visible_repository" (
	"user_id" uuid NOT NULL,
	"repository_id" uuid NOT NULL,
	"ctime" timestamp DEFAULT now() NOT NULL,
	"mtime" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_repository_id_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repository"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_parent_id_folder_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_metadata" ADD CONSTRAINT "file_metadata_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder" ADD CONSTRAINT "folder_repository_id_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repository"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder" ADD CONSTRAINT "folder_parent_id_folder_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder" ADD CONSTRAINT "folder_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository" ADD CONSTRAINT "repository_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository" ADD CONSTRAINT "repository_linked_folder_id_folder_id_fk" FOREIGN KEY ("linked_folder_id") REFERENCES "public"."folder"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visible_repository" ADD CONSTRAINT "visible_repository_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visible_repository" ADD CONSTRAINT "visible_repository_repository_id_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repository"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "file_name_full_path_repository_id_index" ON "file" USING btree ("name","full_path","repository_id");--> statement-breakpoint
CREATE INDEX "file_metadata_sha256_mime_type_index" ON "file_metadata" USING btree ("sha256","mime_type");--> statement-breakpoint
CREATE INDEX "folder_name_full_path_repository_id_index" ON "folder" USING btree ("name","full_path","repository_id");--> statement-breakpoint
CREATE INDEX "user_username_index" ON "user" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "visible_repository_repository_id_user_id_index" ON "visible_repository" USING btree ("repository_id","user_id");--> statement-breakpoint
CREATE VIEW "public"."repository_creator_view" AS (select "user"."username", "user"."is_admin", "user"."is_deleted", "user"."id" as "user_id", "repository"."name", "repository"."linked_folder_id", "repository"."creator_id", "repository"."ctime", "repository"."mtime", "repository"."id" as "repository_id" from "user" inner join "repository" on "repository"."creator_id" = "user"."id");--> statement-breakpoint
CREATE VIEW "public"."user_visible_repository_view" AS (select "user"."username", "user"."is_admin", "user"."is_deleted", "user"."id" as "user_id", "repository"."name", "repository"."linked_folder_id", "repository"."creator_id", "repository"."ctime", "repository"."mtime", "repository"."id" as "repository_id" from "user" inner join "visible_repository" on "user"."id" = "visible_repository"."user_id" inner join "repository" on "repository"."id" = "visible_repository"."repository_id");