import path from 'node:path'
import { type DrizzleCilent, FolderTable, RepositoryTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { isNil } from 'lodash-es'

export type DB = DrizzleCilent

export type UuidOrIdFilter = {
	id: number
	uuid?: undefined
} | {
	id?: undefined
	uuid: string
}

export async function getFolderAbsolutePath(db: DB, repositoryFilter: UuidOrIdFilter, folderFilter: UuidOrIdFilter) {
	const repository = await db.query.RepositoryTable.findFirst({
		where: eq(
			isNil(repositoryFilter.id) ? RepositoryTable.uuid : RepositoryTable.id,
			isNil(repositoryFilter.id) ? repositoryFilter.uuid! : repositoryFilter.id,
		),
		columns: {
			path: true,
		},
	})
	if (isNil(repository)) {
		throw new ForbiddenErrorWithI18n(i18n.error.repositoryNotExists)
	}
	const { path: repositoryPath } = repository
	let folder: {
		id: number
		name: string
		parentId: number | null
	} | undefined
	const paths: string[] = [ ]
	while (true) {
		folder = await db.query.FolderTable.findFirst({
			columns: {
				id: true,
				name: true,
				parentId: true,
			},
			where: eq(
				isNil(folderFilter.id) ? FolderTable.uuid : FolderTable.id,
				isNil(folderFilter.id) ? folderFilter.uuid! : folderFilter.id,
			),
		})
		if (isNil(folder)) {
			throw new ForbiddenErrorWithI18n(i18n.error.pathNotExists)
		}
		paths.push(folder.name)
		if (isNil(folder.parentId))
			break
		folderFilter = {
			id: folder.parentId,
		}
	}
	const res = path.resolve(repositoryPath, ...paths.reverse().slice(1))
	return res
}
