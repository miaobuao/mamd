import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { integer, pgTable, serial, text, unique, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { v4 } from 'uuid'
import { FileTable } from './file'
import { FolderMetadataTable } from './folderMetadata'
import { RepositoryTable } from './repository'
import { UserTable } from './user'

export const FolderTable = pgTable(
	'folder',
	{
		id: serial('id').primaryKey(),
		uuid: uuid('uuid').$default(v4).unique().notNull(),
		name: text('name').notNull(),
		repositoryId: integer('repository_id').references((): AnyPgColumn => RepositoryTable.id),
		parentId: integer('parent_id').references((): AnyPgColumn => FolderTable.id, { onDelete: 'cascade' }),
		creatorId: integer('creator_id').references(() => UserTable.id),
	},
	(t) => [
		unique().on(t.repositoryId, t.parentId, t.name),
		uniqueIndex('folder_uuid_name_idx').on(t.uuid, t.name),
	],
)

export const folderRelations = relations(FolderTable, ({ one, many }) => ({
	repository: one(RepositoryTable, { fields: [ FolderTable.repositoryId ], references: [ RepositoryTable.id ] }),
	parent: one(FolderTable, { relationName: 'parent', fields: [ FolderTable.parentId ], references: [ FolderTable.id ] }),
	creator: one(UserTable, { relationName: 'folder_creator', fields: [ FolderTable.creatorId ], references: [ UserTable.id ] }),
	metadata: one(FolderMetadataTable, { relationName: 'folder-metadata', fields: [ FolderTable.id ], references: [ FolderMetadataTable.folderId ] }),
	linkedRepository: one(RepositoryTable, { relationName: 'linked_folder', fields: [ FolderTable.repositoryId ], references: [ RepositoryTable.id ] }),
	subFolders: many(FolderTable, { relationName: 'folders_parent' }),
	files: many(FileTable, { relationName: 'files_parent' }),
}))
