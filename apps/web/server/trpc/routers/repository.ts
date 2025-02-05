import type { DrizzleCilent } from 'drizzle-client'
import * as fs from 'node:fs/promises'
import { basename } from 'node:path'
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
				uuid: FolderTable.id,
			})
			.from(VisibleRepositoryTable)
			.$dynamic()
			.where(eq(VisibleRepositoryTable.userId, userInfo.id))
			.innerJoin(RepositoryTable, eq(RepositoryTable.id, VisibleRepositoryTable.repositoryId))
			.where(eq(RepositoryTable.id, repositoryUuid))
			.innerJoin(FolderTable, eq(RepositoryTable.linkedFolderId, FolderTable.id))
			.limit(1)
		return folder
	}),

	listVisibleRepository: protectedProcedure.query(async ({ ctx: { db, userInfo } }): Promise<{
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
			uuid: repo.repository.id,
			name: repo.repository.name,
			linkedFolder: {
				uuid: repo.folder.id,
				name: repo.folder.name,
			},
		}))
	}),

	getRepository: protectedProcedure.input(z.object({
		uuid: z.string().uuid(),
	})).query(async ({ ctx: { db, userInfo }, input: { uuid: repositoryUuid } }) => {
		// TODO: handle error: not found
		const res = await db
			.select({
				uuid: RepositoryTable.id,
				name: RepositoryTable.name,
				linkedFolder: {
					uuid: FolderTable.id,
					name: FolderTable.name,
				},
			})
			.from(VisibleRepositoryTable)
			.$dynamic()
			.where(eq(VisibleRepositoryTable.userId, userInfo.id))
			.innerJoin(RepositoryTable, eq(RepositoryTable.id, VisibleRepositoryTable.repositoryId))
			.where(eq(RepositoryTable.id, repositoryUuid))
			.innerJoin(FolderTable, eq(RepositoryTable.linkedFolderId, FolderTable.id))
		return res.at(0)
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
				fullPath: input.path,
				creatorId: userInfo.id,
			}).returning({ id: RepositoryTable.id })
			await tx.insert(VisibleRepositoryTable)
				.values({
					repositoryId: repository.id,
					userId: userInfo.id,
				})
			const [ folder ] = await tx.insert(FolderTable).values({
				name: basename(input.path),
				fullPath: input.path,
				repositoryId: repository.id,
				creatorId: userInfo.id,
			}).returning({
				id: FolderTable.id,
				name: FolderTable.name,
			})
			await tx.update(RepositoryTable).set({
				linkedFolderId: folder.id,
			})
			return {
				uuid: repository.id,
				name: input.name,
				linkedFolder: {
					uuid: folder.id,
					name: folder.name,
				},
			}
		})
		return res
	}),

	scan: adminProcedure.input(z.object({
		repositoryUuid: z.string(),
	})).mutation(async ({ ctx: { db }, input }) => {
		const repository = await db.query.RepositoryTable.findFirst({
			where: eq(RepositoryTable.id, input.repositoryUuid),
			columns: {
				id: true,
				fullPath: true,
			},
		})
		if (!repository) {
			throw new BadRequestErrorWithI18n(i18n.error.repositoryNotExists)
		}
		await scannerTask.publish({
			repositoryId: repository.id,
			repositoryPath: repository.fullPath,
		})
	}),
})

export async function repositoryExists(db: DrizzleCilent, path: string) {
	return !!(await db.query.RepositoryTable.findFirst({
		where: eq(RepositoryTable.fullPath, path),
		columns: {
			id: true,
		},
	}))
}
