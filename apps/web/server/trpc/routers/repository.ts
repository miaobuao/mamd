import type { PrismaClient } from '@prisma/client'
import * as fs from 'node:fs/promises'
import { basename } from 'node:path'
import { BadRequestErrorWithI18n } from '~~/server/utils/error'
import { CreateRepositoryFormValidator } from '~/utils/validator'
import { protectedProcedure, router } from '../trpc'

export const RepositoryRouter = router({
	listVisible: protectedProcedure.query(async ({ ctx: { db, userInfo } }) => {
		return db.visibleRepository.findMany({
			where: {
				userId: userInfo.id,
			},
			select: {
				repository: {
					select: {
						id: true,
						linkedFolder: true,
					},
				},
			},
		})
	}),
	create: protectedProcedure.input(CreateRepositoryFormValidator).mutation(async ({ ctx: { db, userInfo }, input }) => {
		if (await fs.access(input.path).then(() => true).catch(() => false)) {
			const isDir = await fs.lstat(input.path).then(stat => stat.isDirectory())
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
		return db.$transaction(async (tx) => {
			const repository = await tx.repository.create({
				data: {
					name: input.name,
					path: input.path,
					creator: {
						connect: {
							id: userInfo.id,
						},
					},
				},
			})
			await tx.visibleRepository.create({
				data: {
					repository: { connect: { id: repository.id } },
					user: { connect: { id: userInfo.id } },
				},
			})
			const linkedFolder = await tx.folder.create({
				data: {
					repository: {
						connect: {
							id: repository.id,
						},
					},
					linkedRepository: {
						connect: {
							id: repository.id,
						},
					},
					creator: {
						connect: {
							id: userInfo.id,
						},
					},
				},
			})
			const _linkedFolderMetadata = await tx.folderMetadata.create({
				data: {
					name: basename(input.path),
					folder: { connect: { id: linkedFolder.id } },
				},
			})
			await tx.repository.update({
				data: {
					linkedFolderId: linkedFolder.id,
				},
				where: {
					id: repository.id,
				},
			})
			return {
				repositoryId: repository.id,
				linkedFolder,
			}
		})
	}),
})

export async function repositoryExists(db: PrismaClient, path: string) {
	return !!(await db.repository.findFirst({
		where: {
			path,
		},
		select: {
			id: true,
		},
	}))
}
