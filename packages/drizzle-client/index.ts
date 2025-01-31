import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as fileSchema from './schema/file'
import * as fileMetadataSchema from './schema/fileMetadata'
import * as folderSchema from './schema/folder'
import * as folderMetadataSchema from './schema/folderMetadata'
import * as repositorySchema from './schema/repository'
import * as userSchema from './schema/user'
import * as visibleRepositorySchema from './schema/visibleRepository'

export function useDrizzleClient(databaseUrl: string) {
	const client = postgres(databaseUrl)
	const db = drizzle({
		client,
		schema: {
			...fileSchema,
			...fileMetadataSchema,
			...folderSchema,
			...folderMetadataSchema,
			...repositorySchema,
			...userSchema,
			...visibleRepositorySchema,
		},
	})
	return db
}

export type DrizzleCilent = Awaited<ReturnType<typeof useDrizzleClient>>

export * from './schema/file'
export * from './schema/fileMetadata'
export * from './schema/folder'
export * from './schema/folderMetadata'
export * from './schema/repository'
export * from './schema/user'
export * from './schema/visibleRepository'
