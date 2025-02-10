import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { index, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core'
import { FileTable } from './file'
import { RepositoryTable } from './repository'
import { UserTable } from './user'

export const FolderTable = pgTable(
	'folder',
	{
		id: uuid().primaryKey().defaultRandom(),
		name: text().notNull(),
		fullPath: text().notNull(),
		repositoryId: uuid().references((): AnyPgColumn => RepositoryTable.id, { onDelete: 'cascade' }).notNull(),
		parentId: uuid().references((): AnyPgColumn => FolderTable.id, { onDelete: 'cascade' }),
		creatorId: uuid().references(() => UserTable.id),
	},
	(t) => [
		unique().on(t.repositoryId, t.fullPath),
		index().on(t.name, t.fullPath, t.repositoryId),
	],
)

export const folderRelations = relations(FolderTable, ({ one, many }) => ({
	repository: one(RepositoryTable, { relationName: 'belonging_repo', fields: [ FolderTable.repositoryId ], references: [ RepositoryTable.id ] }),
	parent: one(FolderTable, { relationName: 'hierarchical-folder', fields: [ FolderTable.parentId ], references: [ FolderTable.id ] }),
	subFolders: many(FolderTable, { relationName: 'hierarchical-folder' }),
	subFiles: many(FileTable, { relationName: 'hierarchical-file' }),
	creator: one(UserTable, { relationName: 'folder_creator', fields: [ FolderTable.creatorId ], references: [ UserTable.id ] }),
	linkedRepository: one(RepositoryTable, { relationName: 'linked_folder', fields: [ FolderTable.repositoryId ], references: [ RepositoryTable.id ] }),
}))
