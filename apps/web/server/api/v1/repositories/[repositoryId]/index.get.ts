import type { RepositoryModel } from '~~/shared/models/v1/repository'
import { FolderTable, RepositoryTable, UserTable, VisibleRepositoryTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { AssertSessionValid } from '~~/server/api/v1/middleware/assert-session-valid'

export default defineEventHandler<
	{
		routerParams: { id: string }
	},
	Promise<RepositoryModel | undefined>
>({
	onRequest: [ AssertSessionValid ],
	handler: async (event) => {
		const { repositoryId } = getRouterParams(event)
		const { context: { db, user } } = event
		const res = await db
			.select({
				id: RepositoryTable.id,
				name: RepositoryTable.name,
				creator: {
					id: UserTable.id,
					username: UserTable.username,
				},
				linkedFolder: {
					id: FolderTable.id,
					name: FolderTable.name,
					fullPath: FolderTable.fullPath,
				},
			})
			.from(VisibleRepositoryTable)
			.$dynamic()
			.where(eq(VisibleRepositoryTable.userId, user!.id))
			.innerJoin(RepositoryTable, eq(RepositoryTable.id, VisibleRepositoryTable.repositoryId))
			.where(eq(RepositoryTable.id, repositoryId))
			.innerJoin(FolderTable, eq(RepositoryTable.linkedFolderId, FolderTable.id))
			.innerJoin(UserTable, eq(RepositoryTable.creatorId, UserTable.id))
		return res.at(0)
	},
})
