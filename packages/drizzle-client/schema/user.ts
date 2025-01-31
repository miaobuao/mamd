import { relations } from 'drizzle-orm'
import { boolean, pgTable, serial, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { v4 } from 'uuid'
import { FileTable } from './file'
import { FolderTable } from './folder'
import { RepositoryTable } from './repository'
import { VisibleRepositoryTable } from './visibleRepository'

export const UserTable = pgTable(
	'user',
	{
		id: serial('id').primaryKey(),
		uuid: uuid('uuid').$default(v4).unique().notNull(),
		username: text('username').unique().notNull(),
		password: text('password').notNull(),
		isAdmin: boolean('is_admin').default(false),
		ctime: timestamp('created_at').defaultNow(),
		mtime: timestamp('modified_at').defaultNow().$onUpdate(() => new Date()),
		isDeleted: boolean('is_deleted').default(false),
	},
	(table) => [
		uniqueIndex('username_uuid_idx').on(table.username, table.uuid),
	],
)

export const userRelations = relations(UserTable, ({ many }) => ({
	createdRepositories: many(RepositoryTable),
	visibleRepositories: many(VisibleRepositoryTable),
	createdFolders: many(FolderTable, { relationName: 'folder_creator' }),
	createdFiles: many(FileTable, { relationName: 'file_creator' }),
}))
