import { relations } from 'drizzle-orm'
import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { FileTable } from './file'
import { FolderTable } from './folder'
import { RepositoryTable } from './repository'
import { VisibleRepositoryTable } from './visibleRepository'

export const UserTable = pgTable(
	'user',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		username: text('username').unique().notNull(),
		password: text('password').notNull(),
		isAdmin: boolean('is_admin').default(false).notNull(),
		ctime: timestamp().defaultNow(),
		mtime: timestamp().defaultNow().$onUpdate(() => new Date()),
		isDeleted: boolean('is_deleted').default(false),
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
