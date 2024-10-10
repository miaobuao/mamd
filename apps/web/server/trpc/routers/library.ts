import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

export const LibraryRouter = router({
	list: protectedProcedure.query(async ({ ctx: { db, userInfo } }) => {
		return db.visibleLibrary.findMany({
			where: {
				userId: userInfo.id,
			},
			select: {
				library: {
					select: {
						id: true,
						linkedFolder: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
		})
	}),
	create: protectedProcedure.input(z.object({
		path: z.string(),
		name: z.string(),
	})).mutation(async ({ ctx: { db, userInfo }, input }) => {
		return db.$transaction(async (tx) => {
			await tx.$executeRaw`SET CONSTRAINTS ALL DEFERRED`
			const library = await tx.library.create({
				data: {
					creator: {
						connect: {
							id: userInfo.id,
						},
					},
					root: input.path,
					linkedFolder: {
						create: {
							libraryId: '',
							name: input.name,
							creatorId: userInfo.id,
						},
					},
				},
			})
			const linkedFolder = await tx.folder.update({
				where: {
					id: library.linkedFolderId,
				},
				data: {
					libraryId: library.id,
				},
			})
			return {
				libraryId: library.id,
				linkedFolder,
			}
		})
	}),
})
