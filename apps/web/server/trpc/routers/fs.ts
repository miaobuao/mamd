import { isNil } from 'lodash-es'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

export const fsRouter = router({
	listAll: protectedProcedure.input(z.object({
		repositoryUuid: z.string().uuid(),
		folderUuid: z.string().uuid().optional(),
	})).query(async ({ ctx: { db, userInfo }, input: { repositoryUuid, folderUuid } }) => {
		const visibleRepository = await db.visibleRepository.findFirst({
			where: {
				userId: userInfo.id,
				repository: {
					uuid: repositoryUuid,
				},
			},
			select: {
				repository: {
					select: {
						id: true,
						linkedFolder: {
							select: {
								id: true,
								uuid: true,
							},
						},
					},
				},
			},
		})

		if (isNil(visibleRepository)) {
			// TODO: i18n
			throw new ForbiddenErrorWithI18n('')
		}

		folderUuid ??= visibleRepository.repository.linkedFolder?.uuid

		const folders = await db.folder.findMany({
			select: {
				uuid: true,
				name: true,
			},
			where: {
				repositoryId: visibleRepository.repository.id,
				parent: {
					uuid: folderUuid,
				},
			},
		})
		const files = await db.file.findMany({
			select: {
				uuid: true,
				name: true,
			},
			where: {
				repositoryId: visibleRepository.repository.id,
				parent: {
					uuid: folderUuid,
				},
			},
		})
		return [
			...folders.map(d => ({ ...d, isFile: false })),
			...files.map(d => ({ ...d, isFile: true })),
		]
	}),
	getFolder: protectedProcedure.input(z.object({
		repositoryUuid: z.string().uuid(),
		folderUuid: z.string().uuid(),
	})).query(async ({ ctx, input: { folderUuid, repositoryUuid } }) => {
		const repository = await ctx.db.visibleRepository.findFirstOrThrow({
			where: {
				repository: {
					uuid: repositoryUuid,
				},
				userId: ctx.userInfo.id,
			},
			select: {
				repositoryId: true,
			},
		})
		// TODO: handle not found
		return ctx.db.folder.findUniqueOrThrow({
			where: {
				repositoryId: repository.repositoryId,
				uuid: folderUuid,
			},
			select: {
				name: true,
			},
		})
	}),
})
