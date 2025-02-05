import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { FileTable } from './file'
import { FolderTable } from './folder'
import { UserTable } from './user'
import { VisibleRepositoryTable } from './visibleRepository'

export const RepositoryTable = pgTable(
	'repository',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		fullPath: text('full_path').notNull(),
		name: text('name').notNull(),
		creatorId: uuid('creator_id').references(() => UserTable.id, { onDelete: 'no action' }),
		linkedFolderId: uuid('linked_folder_id').unique().references(() => FolderTable.id, { onDelete: 'set null' }),
		ctime: timestamp('created_at').defaultNow(),
		mtime: timestamp('modified_at').defaultNow().$onUpdate(() => new Date()),
	},
	(t) => [
		unique().on(t.creatorId, t.fullPath),
	],
)

export const repositoryRelations = relations(RepositoryTable, ({ one, many }) => ({
	creator: one(UserTable, { fields: [ RepositoryTable.creatorId ], references: [ UserTable.id ] }),
	linkedFolder: one(FolderTable, { relationName: 'linked_folder', fields: [ RepositoryTable.linkedFolderId ], references: [ FolderTable.id ] }),
	visibleRepositories: many(VisibleRepositoryTable),
	folders: many(FolderTable, { relationName: 'belonging_repo' }),
	files: many(FileTable, { relationName: 'repository' }),
}))
