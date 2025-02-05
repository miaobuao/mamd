import { relations } from 'drizzle-orm'
import { bigint, index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { FileTable } from './file'

export const FileMetadataTable = pgTable(
	'file_metadata',
	{
		fileId: uuid('file_id').primaryKey().references(() => FileTable.id, { onDelete: 'cascade' }),
		mimeType: text('mime_type').notNull(),
		sha256: varchar('sha256', { length: 64 }).notNull(),
		size: bigint('size', { mode: 'number' }).notNull(),
		birthtime: timestamp('birthtime').notNull(),
		mtime: timestamp('mtime').notNull(),
	},
	(t) => [
		index().on(t.sha256, t.mimeType),
	],
)

export const fileMetadataRelations = relations(FileMetadataTable, ({ one }) => ({
	file: one(FileTable, { relationName: 'file-metadata', fields: [ FileMetadataTable.fileId ], references: [ FileTable.id ] }),
}))
