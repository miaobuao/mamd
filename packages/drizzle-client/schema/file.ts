import { relations } from 'drizzle-orm'
import { index, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core'
import { FileMetadataTable } from './fileMetadata'
import { FolderTable } from './folder'
import { RepositoryTable } from './repository'
import { UserTable } from './user'

export const FileTable = pgTable(
	'file',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: text('name').notNull(),
		repositoryId: uuid('repository_id').references(() => RepositoryTable.id, { onDelete: 'cascade' }),
		parentId: uuid('parent_id').references(() => FolderTable.id, { onDelete: 'cascade' }),
		creatorId: uuid('creator_id').references(() => UserTable.id),
	},
	(t) => [
		unique().on(t.repositoryId, t.parentId, t.name),
		index().on(t.name),
	],
)

export const fileRelations = relations(FileTable, ({ one }) => ({
	repository: one(RepositoryTable, { relationName: 'repository', fields: [ FileTable.repositoryId ], references: [ RepositoryTable.id ] }),
	parentFolder: one(FolderTable, { relationName: 'hierarchical-file', fields: [ FileTable.parentId ], references: [ FolderTable.id ] }),
	creator: one(UserTable, { relationName: 'file_creator', fields: [ FileTable.creatorId ], references: [ UserTable.id ] }),
	metadata: one(FileMetadataTable, { relationName: 'file-metadata', fields: [ FileTable.id ], references: [ FileMetadataTable.fileId ] }),
}))
