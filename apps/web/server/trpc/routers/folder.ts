import { isNil } from 'lodash-es'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

export const folderRouter = router({
	list: protectedProcedure.input(z.object({
		repositoryUuid: z.string().uuid(),
		folderUuid: z.string().uuid(),
	})).mutation(async ({ ctx: { db, userInfo }, input: { repositoryUuid, folderUuid } }) => {
		const isVisible = await db.visibleRepository.findFirst({
			where: {
				userId: userInfo.id,
				repository: {
					uuid: repositoryUuid,
				},
			},
		})
		if (isNil(isVisible)) {
			throw new ForbiddenErrorWithI18n('')
		}
		const folders = await db.folder.findMany({
			select: {
				id: true,
				name: true,
			},
			where: {
				parent: {
					uuid: folderUuid,
				},
			},
		})
		const files = await db.file.findMany({
			select: {
				id: true,
				name: true,
			},
			where: {
				parent: {
					uuid: folderUuid,
				},
			},
		})
		return [
			...folders.map(({ id, name }) => ({ id, name, isFile: false })),
			...files.map(({ id, name }) => ({ id, name, isFile: true })),
		]
	}),
})
