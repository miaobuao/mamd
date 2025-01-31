import { relations } from 'drizzle-orm'
import { integer, pgTable, serial, text, unique, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { v4 } from 'uuid'
import { FileMetadataTable } from './fileMetadata'
import { FolderTable } from './folder'
import { RepositoryTable } from './repository'
import { UserTable } from './user'

export const FileTable = pgTable(
	'file',
	{
		id: serial('id').primaryKey(),
		uuid: uuid('uuid').$default(v4).unique().notNull(),
		name: text('name').notNull(),
		repositoryId: integer('repository_id').references(() => RepositoryTable.id),
		parentId: integer('parent_id').references(() => FolderTable.id, { onDelete: 'cascade' }),
		creatorId: integer('creator_id').references(() => UserTable.id),
	},
	(t) => [
		unique().on(t.repositoryId, t.parentId, t.name),
		uniqueIndex('file_uuid_name_idx').on(t.uuid, t.name),
	],
)

export const fileRelations = relations(FileTable, ({ one }) => ({
	repository: one(RepositoryTable, { relationName: 'repository', fields: [ FileTable.repositoryId ], references: [ RepositoryTable.id ] }),
	parent: one(FolderTable, { relationName: 'parent', fields: [ FileTable.parentId ], references: [ FolderTable.id ] }),
	creator: one(UserTable, { relationName: 'file_creator', fields: [ FileTable.creatorId ], references: [ UserTable.id ] }),
	metadata: one(FileMetadataTable, { relationName: 'file-metadata', fields: [ FileTable.id ], references: [ FileMetadataTable.fileId ] }),
}))
