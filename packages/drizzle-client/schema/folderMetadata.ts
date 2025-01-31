import { relations } from 'drizzle-orm'
import { integer, pgTable, timestamp } from 'drizzle-orm/pg-core'
import { FolderTable } from './folder'

export const FolderMetadataTable = pgTable(
	'folder_metadata',
	{
		folderId: integer('folder_id').unique().references(() => FolderTable.id, { onDelete: 'cascade' }).notNull(),
		fileCount: integer('file_count').default(0),
		folderCount: integer('folder_count').default(0),
		birthtime: timestamp('birthtime').notNull(),
		mtime: timestamp('mtime').notNull(),
	},
)

export const folderMetadataRelations = relations(FolderMetadataTable, ({ one }) => ({
	folder: one(FolderTable, { relationName: 'folder-metadata', fields: [ FolderMetadataTable.folderId ], references: [ FolderTable.id ] }),
}))
