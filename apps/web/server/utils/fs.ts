import type { DrizzleCilent } from 'drizzle-client'
import { FolderTable } from 'drizzle-client'
import { and, eq } from 'drizzle-orm'
import { isNil } from 'lodash-es'

export type DB = DrizzleCilent

export async function getFolderAbsolutePath(db: DB, repositoryId: string, folderId: string) {
	const repository = await db.query.FolderTable.findFirst({
		where: and(
			eq(FolderTable.id, folderId),
			eq(FolderTable.repositoryId, repositoryId),
		),
		columns: {
			fullPath: true,
		},
	})
	if (isNil(repository)) {
		throw new ForbiddenErrorWithI18n(i18n.error.repositoryNotExists)
	}
	return repository.fullPath
}
