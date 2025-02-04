import { relations } from 'drizzle-orm'
import { pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { RepositoryTable } from './repository'
import { UserTable } from './user'

export const VisibleRepositoryTable = pgTable(
	'visible_repository',
	{
		userId: uuid('user_id').references(() => UserTable.id, { onDelete: 'cascade' }),
		repositoryId: uuid('repository_id').references(() => RepositoryTable.id, { onDelete: 'cascade' }),
		ctime: timestamp('created_at').defaultNow(),
		mtime: timestamp('modified_at').defaultNow().$onUpdate(() => new Date()),
	},
	(t) => [
		uniqueIndex('repo_user_idx').on(t.repositoryId, t.userId),
	],
)

export const visibleRepositoryRelations = relations(VisibleRepositoryTable, ({ one }) => ({
	user: one(UserTable, { fields: [ VisibleRepositoryTable.userId ], references: [ UserTable.id ] }),
	repository: one(RepositoryTable, { fields: [ VisibleRepositoryTable.repositoryId ], references: [ RepositoryTable.id ] }),
}))
