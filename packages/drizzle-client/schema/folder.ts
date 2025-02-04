import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { index, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core'
import { FileTable } from './file'
import { FolderMetadataTable } from './folderMetadata'
import { RepositoryTable } from './repository'
import { UserTable } from './user'

export const FolderTable = pgTable(
	'folder',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: text('name').notNull(),
		repositoryId: uuid('repository_id').references((): AnyPgColumn => RepositoryTable.id, { onDelete: 'cascade' }),
		parentId: uuid('parent_id').references((): AnyPgColumn => FolderTable.id, { onDelete: 'cascade' }),
		creatorId: uuid('creator_id').references(() => UserTable.id),
	},
	(t) => [
		unique().on(t.repositoryId, t.parentId, t.name),
		index().on(t.name),
	],
)

export const folderRelations = relations(FolderTable, ({ one, many }) => ({
	repository: one(RepositoryTable, { relationName: 'belonging_repo', fields: [ FolderTable.repositoryId ], references: [ RepositoryTable.id ] }),
	parent: one(FolderTable, { relationName: 'hierarchical-folder', fields: [ FolderTable.parentId ], references: [ FolderTable.id ] }),
	subFolders: many(FolderTable, { relationName: 'hierarchical-folder' }),
	subFiles: many(FileTable, { relationName: 'hierarchical-file' }),
	creator: one(UserTable, { relationName: 'folder_creator', fields: [ FolderTable.creatorId ], references: [ UserTable.id ] }),
	metadata: one(FolderMetadataTable, { relationName: 'folder-metadata', fields: [ FolderTable.id ], references: [ FolderMetadataTable.folderId ] }),
	linkedRepository: one(RepositoryTable, { relationName: 'linked_folder', fields: [ FolderTable.repositoryId ], references: [ RepositoryTable.id ] }),
}))
