import { relations } from 'drizzle-orm'
import { integer, pgTable, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core'
import { FileTable } from './file'

export const FileMetadataTable = pgTable(
	'file_metadata',
	{
		fileId: integer('file_id').unique().references(() => FileTable.id, { onDelete: 'cascade' }).notNull(),
		mimeType: text('mime_type').notNull(),
		sha256: varchar('sha256', { length: 64 }).notNull(),
		size: integer('size').notNull(),
		birthtime: timestamp('birthtime').notNull(),
		mtime: timestamp('mtime').notNull(),
	},
	(t) => [
		uniqueIndex('sha256_mime_idx').on(t.sha256, t.mimeType),
	],
)

export const fileMetadataRelations = relations(FileMetadataTable, ({ one }) => ({
	file: one(FileTable, { relationName: 'file-metadata', fields: [ FileMetadataTable.fileId ], references: [ FileTable.id ] }),
}))
