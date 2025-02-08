import { FolderTable, RepositoryTable, UserTable, VisibleRepositoryTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { AssertSessionValid } from '../middleware/assert-session-valid'

export default defineEventHandler<{}, Promise<{
	uuid: string
	name: string
	creator: {
		id: string
		username: string
	}
	linkedFolder: { uuid: string, name: string }
}[]>>({
	onRequest: [ AssertSessionValid ],
	handler: async (event) => {
		const res = await event.context.db
			.select({
				uuid: RepositoryTable.id,
				name: RepositoryTable.name,
				creator: {
					id: UserTable.id,
					username: UserTable.username,
				},
				linkedFolder: {
					uuid: FolderTable.id,
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
