import type { PrismaClient } from '@prisma/client'
import * as fs from 'node:fs/promises'
import { basename } from 'node:path'
import { scannerTask } from '@repo/workers'
import { BadRequestErrorWithI18n } from '~~/server/utils/error'
import { z } from 'zod'
import { CreateRepositoryFormValidator } from '~/utils/validator'
import { adminProcedure, protectedProcedure, router } from '../trpc'

export const RepositoryRouter = router({
	getLinkedFolder: protectedProcedure.input(z.object({
		repositoryUuid: z.string().uuid(),
	})).mutation(async ({ input: { repositoryUuid }, ctx: { db, userInfo } }) => {
		// TODO: handle error
		const repository = await db.visibleRepository.findFirstOrThrow({
			where: {
				userId: userInfo.id,
				repository: {
					uuid: repositoryUuid,
				},
			},
			select: {
				repository: {
					select: {
						linkedFolder: {
							select: {
								uuid: true,
							},
						},
					},
				},
			},
		})
		return repository.repository.linkedFolder
	}),
	listVisible: protectedProcedure.query(async ({ ctx: { db, userInfo } }) => {
		return db.visibleRepository.findMany({
			where: {
				userId: userInfo.id,
			},
			select: {
				repository: {
					select: {
						uuid: true,
						name: true,
						linkedFolder: {
							select: {
								name: true,
								uuid: true,
							},
						},
					},
				},
			},
		}).then(repos => repos.map(repo => repo.repository))
	}),
	getRepository: protectedProcedure.input(z.object({
		uuid: z.string().uuid(),
	})).query(async ({ ctx, input }) => {
		// TODO: handle error
		return ctx.db.visibleRepository.findFirstOrThrow({
			where: {
				repository: {
					uuid: input.uuid,
				},
			},
			select: {
				repository: {
					select: {
						uuid: true,
						name: true,
						linkedFolder: {
							select: {
								name: true,
								uuid: true,
							},
						},
					},
				},
			},
		})
	}),
	create: adminProcedure.input(CreateRepositoryFormValidator).mutation(async ({ ctx: { db, userInfo }, input }) => {
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
					name: basename(input.path),
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
			await tx.repository.update({
				data: {
					linkedFolderId: linkedFolder.id,
				},
				where: {
					id: repository.id,
				},
			})
			await scannerTask.publish({
				repositoryId: repository.id,
				repositoryPath: input.path,
			})
			return {
				uuid: repository.uuid,
				name: repository.name,
				linkedFolder: {
					uuid: linkedFolder.uuid,
					name: linkedFolder.name,
				},
			}
		})
	}),

	scan: adminProcedure.input(z.object({
		repositoryUuid: z.string(),
	})).mutation(async ({ ctx: { db }, input }) => {
		const repository = await db.repository.findFirst({
			where: {
				uuid: input.repositoryUuid,
			},
			select: {
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
