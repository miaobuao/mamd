import { FileTable, FolderTable, RepositoryTable, VisibleRepositoryTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'
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
			.where(eq(RepositoryTable.uuid, repositoryUuid))
			.innerJoin(FolderTable, eq(RepositoryTable.linkedFolderId, FolderTable.id))
			.limit(1)

		if (isNil(visibleRepository)) {
			// TODO: i18n
			throw new ForbiddenErrorWithI18n('')
		}

		folderUuid ??= visibleRepository.folder.uuid

		const SubFoldersTable = db
			.select()
			.from(FolderTable)
			.as('SubFolders')
		const folders = await db
			.select({
				uuid: SubFoldersTable.uuid,
				name: SubFoldersTable.name,
			})
			.from(FolderTable)
			.where(eq(FolderTable.uuid, folderUuid))
			.innerJoin(SubFoldersTable, eq(SubFoldersTable.id, FolderTable.parentId))
		const SubFilesTable = db
			.select()
			.from(FileTable)
			.as('SubFiles')
		const files = await db
			.select({
				uuid: SubFilesTable.uuid,
				name: SubFilesTable.name,
			})
			.from(FolderTable)
			.where(eq(FolderTable.uuid, folderUuid))
			.innerJoin(SubFilesTable, eq(SubFilesTable.parentId, FolderTable.id))
		return [
			...folders.map((d) => ({ ...d, isFile: false })),
			...files.map((d) => ({ ...d, isFile: true })),
		]
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
			.where(eq(RepositoryTable.uuid, repositoryUuid))
			.innerJoin(
				FolderTable,
				eq(FolderTable.id, RepositoryTable.linkedFolderId),
			)
			.where(eq(FolderTable.uuid, folderUuid))
	}),
})
