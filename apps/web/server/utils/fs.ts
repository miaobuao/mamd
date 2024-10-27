import type { PrismaClient } from 'prisma-client-js'
import path from 'node:path'
import { isNil } from 'lodash-es'

export type DB = PrismaClient

export type UuidOrIdFilter = {
	id: number
} | {
	uuid: string
}

export async function getFolderAbsolutePath(db: DB, repositoryFilter: UuidOrIdFilter, folderFilter: UuidOrIdFilter) {
	const { path: repositoryPath } = await db.repository.findFirstOrThrow({
		where: repositoryFilter,
		select: {
			path: true,
		},
	})
	let folder: {
		id: number
		name: string
		parentId: number | null
	} | null
	const paths: string[] = [ ]
	while (true) {
		folder = await db.folder.findFirstOrThrow({
			select: {
				id: true,
				name: true,
				parentId: true,
			},
			where: folderFilter,
		})
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
