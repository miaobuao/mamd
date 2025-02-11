import path from 'node:path'
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
				...subs.subFolders.map((d) => ({ id: d.id, name: d.name, isDir: true })),
				...subs.subFiles.map((d) => ({ id: d.id, name: d.name, isDir: false })),
			]
			: []
	}),

	listAllFromPath: protectedProcedure.input(
		z.object({
			repositoryId: z.string().uuid(),
			path: z.string().default(''),
		}),
	).query(async ({ input, ctx: { db, userInfo } }) => {
		const [ root ] = await db
			.select({
				folderId: FolderTable.id,
				root: FolderTable.fullPath,
			})
			.from(VisibleRepositoryTable)
			.$dynamic()
			.where(and(
				eq(VisibleRepositoryTable.userId, userInfo.id),
				eq(VisibleRepositoryTable.repositoryId, input.repositoryId),
			))
			.innerJoin(RepositoryTable, eq(RepositoryTable.id, VisibleRepositoryTable.repositoryId))
			.innerJoin(FolderTable, eq(FolderTable.id, RepositoryTable.linkedFolderId))
		if (isNil(root)) {
			throw new ForbiddenErrorWithI18n(i18n.error.repositoryNotExists)
		}
		const fullPath = path.join(root.root, input.path)
		const folder = await db
			.query
			.FolderTable
			.findFirst({
				where: and(
					eq(FolderTable.repositoryId, input.repositoryId),
					eq(FolderTable.fullPath, fullPath),
				),
				with: {
					subFolders: true,
					subFiles: true,
				},
			})
		return folder
			? [
				...folder.subFolders.map((d) => ({ id: d.id, name: d.name, isDir: true })),
				...folder.subFiles.map((d) => ({ id: d.id, name: d.name, isDir: false })),
			]
			: []
	}),

	getFolder: protectedProcedure.input(z.object({
		repositoryId: z.string().uuid(),
		path: z.string().optional(),
	})).query(async ({ ctx: { db, userInfo }, input }) => {
		// TODO: handle not found
		if (!input.path) {
			return await db
				.select({
					id: FolderTable.id,
					name: FolderTable.name,
					fullPath: FolderTable.fullPath,
				})
				.from(VisibleRepositoryTable)
				.$dynamic()
				.where(eq(VisibleRepositoryTable.userId, userInfo.id))
				.where(eq(VisibleRepositoryTable.repositoryId, input.repositoryId))
				.innerJoin(RepositoryTable, eq(RepositoryTable.id, VisibleRepositoryTable.repositoryId))
				.innerJoin(FolderTable, eq(FolderTable.id, RepositoryTable.linkedFolderId))
				.then((d) => d.at(0))
		}
		const rootFolder = await db
			.select({
				fullPath: FolderTable.fullPath,
			})
			.from(VisibleRepositoryTable)
			.$dynamic()
			.where(eq(VisibleRepositoryTable.userId, userInfo.id))
			.where(eq(VisibleRepositoryTable.repositoryId, input.repositoryId))
			.innerJoin(RepositoryTable, eq(RepositoryTable.id, VisibleRepositoryTable.repositoryId))
			.innerJoin(FolderTable, eq(FolderTable.repositoryId, RepositoryTable.linkedFolderId))
			.then((d) => d.at(0))
		if (!rootFolder?.fullPath) {
			throw new ForbiddenErrorWithI18n(i18n.error.pathNotExists)
		}
		const fullPath = path.join(rootFolder.fullPath, input.path)
		return await db.query.FolderTable.findFirst({
			where: and(
				eq(FolderTable.repositoryId, input.repositoryId),
				eq(FolderTable.fullPath, fullPath),
			),
			columns: {
				id: true,
				name: true,
				fullPath: true,
			},
		})
	}),
})
