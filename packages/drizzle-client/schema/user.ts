import { relations } from 'drizzle-orm'
import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { FileTable } from './file'
import { FolderTable } from './folder'
import { RepositoryTable } from './repository'
import { VisibleRepositoryTable } from './visibleRepository'

export const UserTable = pgTable(
	'user',
	{
		id: uuid().primaryKey().defaultRandom(),
		username: text().unique().notNull(),
		password: text().notNull(),
		isAdmin: boolean().default(false).notNull(),
		isDeleted: boolean().default(false).notNull(),
		ctime: timestamp().defaultNow().notNull(),
		mtime: timestamp().defaultNow().$onUpdate(() => new Date()).notNull(),
	},
	(t) => [
		index().on(t.username),
	],
)

export const userRelations = relations(UserTable, ({ many }) => ({
	createdRepositories: many(RepositoryTable),
	visibleRepositories: many(VisibleRepositoryTable),
	createdFolders: many(FolderTable, { relationName: 'folder_creator' }),
	createdFiles: many(FileTable, { relationName: 'file_creator' }),
}))
