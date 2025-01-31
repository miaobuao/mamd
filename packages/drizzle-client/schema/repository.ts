import { relations } from 'drizzle-orm'
import { integer, pgTable, serial, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { v4 } from 'uuid'
import { FileTable } from './file'
import { FolderTable } from './folder'
import { UserTable } from './user'
import { VisibleRepositoryTable } from './visibleRepository'

export const RepositoryTable = pgTable(
	'repository',
	{
		id: serial('id').primaryKey(),
		uuid: uuid('uuid').$default(v4).unique().notNull(),
		path: text('path').unique().notNull(),
		name: text('name').unique().notNull(),
		ctime: timestamp('created_at').defaultNow(),
		mtime: timestamp('modified_at').defaultNow().$onUpdate(() => new Date()),
		creatorId: integer('creator_id').references(() => UserTable.id, { onDelete: 'no action' }),
		linkedFolderId: integer('linked_folder_id').unique().references(() => FolderTable.id, { onDelete: 'set null' }),
	},
	(t) => [
		uniqueIndex('repository_uuid_idx').on(t.uuid),
	],
)

export const repositoryRelations = relations(RepositoryTable, ({ one, many }) => ({
	creator: one(UserTable, { fields: [ RepositoryTable.creatorId ], references: [ UserTable.id ] }),
	linkedFolder: one(FolderTable, { relationName: 'linked_folder', fields: [ RepositoryTable.linkedFolderId ], references: [ FolderTable.id ] }),
	visibleRepositories: many(VisibleRepositoryTable),
	folders: many(FolderTable),
	files: many(FileTable, { relationName: 'repository' }),
}))
