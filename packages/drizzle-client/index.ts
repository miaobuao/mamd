import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as fileSchema from './schema/file'
import * as fileMetadataSchema from './schema/fileMetadata'
import * as folderSchema from './schema/folder'
import * as repositorySchema from './schema/repository'
import * as repositoryCreatorView from './schema/repositoryCreatorView'
import * as userSchema from './schema/user'
import * as userVisibleRepositoryView from './schema/userVisibleRepositoryView'
import * as visibleRepositorySchema from './schema/visibleRepository'

const clients: Record<string, DrizzleCilent> = {}

function createDrizzleClient(databaseUrl: string) {
	const client = postgres(databaseUrl)
	const db = drizzle({
		client,
		schema: {
			...fileSchema,
			...fileMetadataSchema,
			...folderSchema,
			...repositorySchema,
			...userSchema,
			...visibleRepositorySchema,
			...repositoryCreatorView,
			...userVisibleRepositoryView,
		},
		casing: 'snake_case',
	})
	return db
}

export function useDrizzleClient(databaseUrl: string) {
	const client = clients[databaseUrl] ?? createDrizzleClient(databaseUrl)
	clients[databaseUrl] = client
	return client
}

export type DrizzleCilent = Awaited<ReturnType<typeof createDrizzleClient>>

export * from './schema/file'
export * from './schema/fileMetadata'
export * from './schema/folder'
export * from './schema/repository'
export * from './schema/repositoryCreatorView'
export * from './schema/user'
export * from './schema/userVisibleRepositoryView'
export * from './schema/visibleRepository'
