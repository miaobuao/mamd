import { relations } from 'drizzle-orm'
import { pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { RepositoryTable } from './repository'
import { UserTable } from './user'

export const VisibleRepositoryTable = pgTable(
	'visible_repository',
	{
		userId: uuid().references(() => UserTable.id, { onDelete: 'cascade' }).notNull(),
		repositoryId: uuid().references(() => RepositoryTable.id, { onDelete: 'cascade' }).notNull(),
		ctime: timestamp().defaultNow().notNull(),
		mtime: timestamp().defaultNow().$onUpdate(() => new Date()).notNull(),
	},
	(t) => [
		uniqueIndex().on(t.repositoryId, t.userId),
	],
)

export const visibleRepositoryRelations = relations(VisibleRepositoryTable, ({ one }) => ({
	user: one(UserTable, { fields: [ VisibleRepositoryTable.userId ], references: [ UserTable.id ] }),
	repository: one(RepositoryTable, { fields: [ VisibleRepositoryTable.repositoryId ], references: [ RepositoryTable.id ] }),
}))
