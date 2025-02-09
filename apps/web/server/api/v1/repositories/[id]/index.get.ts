import type { RepositoryModel } from '../repository.entity'
import { FolderTable, RepositoryTable, UserTable, VisibleRepositoryTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { AssertSessionValid } from '~~/server/middleware/assert-session-valid'

export default defineEventHandler<
	{
		routerParams: { id: string }
	},
	Promise<RepositoryModel | undefined>
>({
	onRequest: [ AssertSessionValid ],
	handler: async (event) => {
		const repositoryId = event.context.params!.id!
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
