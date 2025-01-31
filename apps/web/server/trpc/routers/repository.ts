import type { DrizzleCilent } from 'drizzle-client'
import * as fs from 'node:fs/promises'
import { scannerTask } from '@repo/workers'
import { BadRequestErrorWithI18n } from '~~/server/utils/error'
import { FolderTable, RepositoryTable, VisibleRepositoryTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { CreateRepositoryFormValidator } from '~/utils/validator'
import { adminProcedure, protectedProcedure, router } from '../trpc'

export const RepositoryRouter = router({
	getLinkedFolder: protectedProcedure.input(z.object({
		repositoryUuid: z.string().uuid(),
	})).mutation(async ({ input: { repositoryUuid }, ctx: { db, userInfo } }): Promise<{ uuid: string }> => {
		// TODO: handle not found
		const [ folder ] = await db
			.select({
				uuid: FolderTable.uuid,
			})
			.from(VisibleRepositoryTable)
			.$dynamic()
			.where(eq(VisibleRepositoryTable.userId, userInfo.id))
			.innerJoin(RepositoryTable, eq(RepositoryTable.id, VisibleRepositoryTable.repositoryId))
			.where(eq(RepositoryTable.uuid, repositoryUuid))
			.innerJoin(FolderTable, eq(RepositoryTable.linkedFolderId, FolderTable.id))
			.limit(1)
		return folder
	}),

	listVisible: protectedProcedure.query(async ({ ctx: { db, userInfo } }): Promise<{
		uuid: string
		name: string
		linkedFolder: { uuid: string, name: string }
	}[]> => {
		const visibleRepositories = await db
			.select()
			.from(VisibleRepositoryTable)
			.where(eq(VisibleRepositoryTable.userId, userInfo.id))
			.innerJoin(RepositoryTable, eq(RepositoryTable.id, VisibleRepositoryTable.repositoryId))
			.innerJoin(FolderTable, eq(RepositoryTable.linkedFolderId, FolderTable.id))
		return visibleRepositories.map((repo) => ({
			uuid: repo.repository.uuid,
			name: repo.repository.name,
			linkedFolder: {
				uuid: repo.folder.uuid,
				name: repo.folder.name,
			},
		}))
	}),

	getRepository: protectedProcedure.input(z.object({
		uuid: z.string().uuid(),
	})).query(async ({ ctx: { db, userInfo }, input: { uuid: repositoryUuid } }) => {
		// TODO: handle error: not found
		const [ res ] = await db
			.select({
				uuid: RepositoryTable.uuid,
				name: RepositoryTable.name,
				linkedFolder: {
					uuid: FolderTable.uuid,
					name: FolderTable.name,
				},
			})
			.from(VisibleRepositoryTable)
			.$dynamic()
			.where(eq(VisibleRepositoryTable.userId, userInfo.id))
			.innerJoin(RepositoryTable, eq(RepositoryTable.id, VisibleRepositoryTable.repositoryId))
			.where(eq(RepositoryTable.uuid, repositoryUuid))
			.innerJoin(FolderTable, eq(RepositoryTable.linkedFolderId, FolderTable.id))
		return res
	}),

	create: adminProcedure.input(CreateRepositoryFormValidator).mutation(async ({ ctx: { db, userInfo }, input }) => {
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
				path: input.path,
				creatorId: userInfo.id,
			}).returning({ id: RepositoryTable.id, uuid: RepositoryTable.uuid })
			await tx.insert(VisibleRepositoryTable)
				.values({
					repositoryId: repository.id,
					userId: userInfo.id,
				})
			const [ folder ] = await tx.insert(FolderTable).values({
				name: input.name,
				repositoryId: repository.id,
				creatorId: userInfo.id,
			}).returning({
				id: FolderTable.id,
				uuid: FolderTable.uuid,
			})
			await tx.update(RepositoryTable).set({
				linkedFolderId: folder.id,
			})
			return {
				uuid: repository.uuid,
				name: input.name,
				linkedFolder: {
					uuid: folder.uuid,
					name: input.name,
				},
			}
		})
		return res
	}),

	scan: adminProcedure.input(z.object({
		repositoryUuid: z.string(),
	})).mutation(async ({ ctx: { db }, input }) => {
		const repository = await db.query.RepositoryTable.findFirst({
			where: eq(RepositoryTable.uuid, input.repositoryUuid),
			columns: {
				id: true,
				path: true,
			},
		})
		if (!repository) {
			throw new BadRequestErrorWithI18n(i18n.error.repositoryNotExists)
		}
		await scannerTask.publish({
			repositoryId: repository.id,
			repositoryPath: repository.path,
		})
	}),
})

export async function repositoryExists(db: DrizzleCilent, path: string) {
	return !!(await db.query.RepositoryTable.findFirst({
		where: eq(RepositoryTable.path, path),
		columns: {
			id: true,
		},
	}))
}
