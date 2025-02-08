import type { RepositoryModel } from './repository.entity'
import { FolderTable, RepositoryTable, UserTable, VisibleRepositoryTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { AssertSessionValid } from '../middleware/assert-session-valid'

export default defineEventHandler<{}, Promise<RepositoryModel[]>>({
	onRequest: [ AssertSessionValid ],
	handler: async (event) => {
		const res = await event.context.db
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
			.where(eq(VisibleRepositoryTable.userId, event.context.user!.id))
			.innerJoin(RepositoryTable, eq(RepositoryTable.id, VisibleRepositoryTable.repositoryId))
			.innerJoin(FolderTable, eq(RepositoryTable.linkedFolderId, FolderTable.id))
			.innerJoin(UserTable, eq(RepositoryTable.creatorId, UserTable.id))
		return res
	},
})
