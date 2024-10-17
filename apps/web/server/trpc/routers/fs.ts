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
})
