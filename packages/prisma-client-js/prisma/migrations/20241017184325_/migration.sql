-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visible_repository" (
    "user_id" INTEGER NOT NULL,
    "repository_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visible_repository_pkey" PRIMARY KEY ("user_id","repository_id")
);

-- CreateTable
CREATE TABLE "repository" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "linked_folder_id" INTEGER,

    CONSTRAINT "repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folder" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "repository_id" INTEGER,
    "parent_id" INTEGER,
    "creator_id" INTEGER NOT NULL,

    CONSTRAINT "folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folder_metadata" (
    "id" SERIAL NOT NULL,
    "folderId" INTEGER NOT NULL,
    "fileCount" INTEGER NOT NULL DEFAULT 0,
    "folderCount" INTEGER NOT NULL DEFAULT 0,
    "birthtime" TIMESTAMP(3) NOT NULL,
    "mtime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folder_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "repository_id" INTEGER,
    "parent_id" INTEGER,
    "creator_id" INTEGER NOT NULL,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_metadata" (
    "id" SERIAL NOT NULL,
    "fileId" INTEGER NOT NULL,
    "sha256" TEXT,
    "birthtime" TIMESTAMP(3) NOT NULL,
    "mtime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_comment" (
    "id" SERIAL NOT NULL,
    "fileId" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_tag_on_file" (
    "tag_id" INTEGER NOT NULL,
    "fileId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_tag_on_file_pkey" PRIMARY KEY ("tag_id","fileId")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_uuid_key" ON "user"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE INDEX "user_username_uuid_idx" ON "user"("username", "uuid");

-- CreateIndex
CREATE INDEX "visible_repository_repository_id_user_id_idx" ON "visible_repository"("repository_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "repository_uuid_key" ON "repository"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "repository_path_key" ON "repository"("path");

-- CreateIndex
CREATE UNIQUE INDEX "repository_name_key" ON "repository"("name");

-- CreateIndex
CREATE UNIQUE INDEX "repository_linked_folder_id_key" ON "repository"("linked_folder_id");

-- CreateIndex
CREATE INDEX "repository_uuid_idx" ON "repository"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "folder_uuid_key" ON "folder"("uuid");

-- CreateIndex
CREATE INDEX "folder_uuid_name_idx" ON "folder"("uuid", "name");

-- CreateIndex
CREATE UNIQUE INDEX "folder_repository_id_parent_id_name_key" ON "folder"("repository_id", "parent_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "folder_metadata_folderId_key" ON "folder_metadata"("folderId");

-- CreateIndex
CREATE UNIQUE INDEX "file_uuid_key" ON "file"("uuid");

-- CreateIndex
CREATE INDEX "file_uuid_name_idx" ON "file"("uuid", "name");

-- CreateIndex
CREATE UNIQUE INDEX "file_repository_id_parent_id_name_key" ON "file"("repository_id", "parent_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "file_metadata_fileId_key" ON "file_metadata"("fileId");

-- CreateIndex
CREATE INDEX "file_metadata_sha256_idx" ON "file_metadata"("sha256");

-- CreateIndex
CREATE INDEX "file_tag_name_idx" ON "file_tag"("name");

-- AddForeignKey
ALTER TABLE "visible_repository" ADD CONSTRAINT "visible_repository_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visible_repository" ADD CONSTRAINT "visible_repository_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repository" ADD CONSTRAINT "repository_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repository" ADD CONSTRAINT "repository_linked_folder_id_fkey" FOREIGN KEY ("linked_folder_id") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "repository"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder_metadata" ADD CONSTRAINT "folder_metadata_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "repository"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_metadata" ADD CONSTRAINT "file_metadata_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_comment" ADD CONSTRAINT "file_comment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_comment" ADD CONSTRAINT "file_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_tag_on_file" ADD CONSTRAINT "file_tag_on_file_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "file_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_tag_on_file" ADD CONSTRAINT "file_tag_on_file_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE;
