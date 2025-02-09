import type { DrizzleCilent } from 'drizzle-client'
import type { TypeOf } from 'zod'
import type { RepositoryModel } from './repository.entity'
import * as fs from 'node:fs/promises'
import { basename } from 'node:path'
import { FolderTable, RepositoryTable, VisibleRepositoryTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { AssertUserIsAdmin } from '~~/server/middleware/assert-user-is-admin'

export async function repositoryExists(db: DrizzleCilent, path: string) {
	const res = await db
		.select()
		.from(RepositoryTable)
		.innerJoin(FolderTable, eq(FolderTable.repositoryId, RepositoryTable.id))
		.where(eq(FolderTable.fullPath, path))
		.limit(1)
	return res.length > 0
}

export default defineEventHandler<
	{
		body: TypeOf<typeof CreateRepositoryFormValidator>
	},
	Promise<RepositoryModel>
>({
	onRequest: [ AssertUserIsAdmin ],
	handler: async (event) => {
		const input = await readBody(event)
		const { context: { db, user } } = event
		if (await fs.access(input.path).then(() => true).catch(() => false)) {
			const isDir = await fs.lstat(input.path).then((stat) => stat.isDirectory())
			if (!isDir) {
				throw new BadRequestErrorWithI18n(i18n.error.pathIsNotDirectory)
			}
		}
		else {
			throw new BadRequestErrorWithI18n(i18n.error.pathNotExists)
		}
		if (await repositoryExists(db, input.path)) {
			throw new BadRequestErrorWithI18n(i18n.error.repositoryAlreadyExists)
		}
		const res = await db.transaction(async (tx) => {
			const [ repository ] = await tx.insert(RepositoryTable).values({
				name: input.name,
				creatorId: user!.id,
			}).returning({ id: RepositoryTable.id })
			await tx.insert(VisibleRepositoryTable)
				.values({
					repositoryId: repository.id,
					userId: user!.id,
				})
			const [ folder ] = await tx.insert(FolderTable).values({
				name: basename(input.path),
				fullPath: input.path,
				repositoryId: repository.id,
				creatorId: user!.id,
			}).returning({
				id: FolderTable.id,
				name: FolderTable.name,
			})
			await tx.update(RepositoryTable).set({
				linkedFolderId: folder.id,
			})
			return {
				id: repository.id,
				name: input.name,
				creator: {
					id: user!.id,
					username: user!.username,
				},
				linkedFolder: {
					id: folder.id,
					name: folder.name,
				},
			}
		})
		return res
	},
})
