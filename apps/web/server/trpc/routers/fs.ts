import { FolderTable, RepositoryTable, VisibleRepositoryTable } from 'drizzle-client'
import { and, eq } from 'drizzle-orm'
import { isNil } from 'lodash-es'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

export const fsRouter = router({
	listAll: protectedProcedure.input(z.object({
		repositoryUuid: z.string().uuid(),
		folderUuid: z.string().uuid().optional(),
	})).query(async ({ ctx: { db, userInfo }, input: { repositoryUuid, folderUuid } }) => {
		const [ visibleRepository ] = await db
			.select()
			.from(VisibleRepositoryTable)
			.$dynamic()
			.where(eq(VisibleRepositoryTable.userId, userInfo.id))
			.innerJoin(RepositoryTable, eq(RepositoryTable.id, VisibleRepositoryTable.repositoryId))
			.where(eq(RepositoryTable.id, repositoryUuid))
			.innerJoin(FolderTable, eq(RepositoryTable.linkedFolderId, FolderTable.id))
			.limit(1)

		if (isNil(visibleRepository)) {
			// TODO: i18n
			throw new ForbiddenErrorWithI18n('')
		}

		folderUuid ??= visibleRepository.folder.id

		const subs = await db.query.FolderTable.findFirst({
			where: and(
				eq(FolderTable.id, folderUuid),
				eq(FolderTable.repositoryId, repositoryUuid),
			),
			with: {
				subFiles: true,
				subFolders: true,
			},
		})

		return subs
			? [
				...subs.subFolders.map((d) => ({ id: d.id, name: d.name, isFile: false })),
				...subs.subFiles.map((d) => ({ id: d.id, name: d.name, isFile: true })),
			]
			: []
	}),

	getFolder: protectedProcedure.input(z.object({
		repositoryUuid: z.string().uuid(),
		folderUuid: z.string().uuid(),
	})).query(async ({ ctx: { db, userInfo }, input: { folderUuid, repositoryUuid } }) => {
		// TODO: handle not found
		return await db
			.select({
				name: FolderTable.name,
			})
			.from(VisibleRepositoryTable)
			.$dynamic()
			.where(eq(VisibleRepositoryTable.userId, userInfo.id))
			.innerJoin(
				RepositoryTable,
				eq(RepositoryTable.id, VisibleRepositoryTable.repositoryId),
			)
			.where(eq(RepositoryTable.id, repositoryUuid))
			.innerJoin(
				FolderTable,
				eq(FolderTable.id, RepositoryTable.linkedFolderId),
			)
			.where(eq(FolderTable.id, folderUuid))
			.limit(1)
			.then((d) => d.at(0))
	}),
})
