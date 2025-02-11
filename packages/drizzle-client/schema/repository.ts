import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { FileTable } from './file'
import { FolderTable } from './folder'
import { UserTable } from './user'
import { VisibleRepositoryTable } from './visibleRepository'

export const RepositoryTable = pgTable(
	'repository',
	{
		id: uuid().primaryKey().defaultRandom(),
		name: text().notNull(),
		creatorId: uuid().references(() => UserTable.id, { onDelete: 'no action' }).notNull(),
		linkedFolderId: uuid().references(() => FolderTable.id, { onDelete: 'set null' }),
		ctime: timestamp().defaultNow().notNull(),
		mtime: timestamp().defaultNow().$onUpdate(() => new Date()).notNull(),
	},
)

export const repositoryRelations = relations(RepositoryTable, ({ one, many }) => ({
	creator: one(UserTable, { fields: [ RepositoryTable.creatorId ], references: [ UserTable.id ] }),
	linkedFolder: one(FolderTable, { relationName: 'linked_folder', fields: [ RepositoryTable.linkedFolderId ], references: [ FolderTable.id ] }),
	visibleRepositories: many(VisibleRepositoryTable),
	folders: many(FolderTable, { relationName: 'belonging_repo' }),
	files: many(FileTable, { relationName: 'repository' }),
}))
