-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visible_library" (
    "user_id" TEXT NOT NULL,
    "library_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visible_library_pkey" PRIMARY KEY ("user_id","library_id")
);

-- CreateTable
CREATE TABLE "library" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "root" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "linked_folder_id" TEXT NOT NULL,

    CONSTRAINT "library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folder" (
    "id" TEXT NOT NULL,
    "library_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file" (
    "id" TEXT NOT NULL,
    "library_id" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "ctime" TIMESTAMP(3) NOT NULL,
    "mtime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileComment" (
    "id" SERIAL NOT NULL,
    "fileId" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileComment_pkey" PRIMARY KEY ("id")
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
    "fileId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_tag_on_file_pkey" PRIMARY KEY ("tag_id","fileId")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE INDEX "user_username_idx" ON "user"("username");

-- CreateIndex
CREATE INDEX "visible_library_library_id_user_id_idx" ON "visible_library"("library_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "library_linked_folder_id_key" ON "library"("linked_folder_id");

-- CreateIndex
CREATE INDEX "folder_library_id_parent_id_idx" ON "folder"("library_id", "parent_id");

-- CreateIndex
CREATE INDEX "file_sha256_library_id_parent_id_idx" ON "file"("sha256", "library_id", "parent_id");

-- CreateIndex
CREATE INDEX "file_tag_name_idx" ON "file_tag"("name");

-- AddForeignKey
ALTER TABLE "visible_library" ADD CONSTRAINT "visible_library_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visible_library" ADD CONSTRAINT "visible_library_library_id_fkey" FOREIGN KEY ("library_id") REFERENCES "library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library" ADD CONSTRAINT "library_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library" ADD CONSTRAINT "library_linked_folder_id_fkey" FOREIGN KEY ("linked_folder_id") REFERENCES "folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_library_id_fkey" FOREIGN KEY ("library_id") REFERENCES "library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_library_id_fkey" FOREIGN KEY ("library_id") REFERENCES "library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileComment" ADD CONSTRAINT "FileComment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileComment" ADD CONSTRAINT "FileComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_tag_on_file" ADD CONSTRAINT "file_tag_on_file_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "file_tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_tag_on_file" ADD CONSTRAINT "file_tag_on_file_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
