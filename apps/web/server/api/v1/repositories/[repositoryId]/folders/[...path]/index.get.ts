import type { FolderModel } from '~~/shared/models/v1/folder'
import { join } from 'node:path'
import { FolderTable, UserVisibleRepositoryView } from 'drizzle-client'
import { and, eq } from 'drizzle-orm'
import { last } from 'lodash-es'
import { pick } from 'ramda'
import { AssertSessionValid } from '~~/server/api/v1/middleware/assert-session-valid'

export default defineEventHandler<
	{
		routerParams: {
			id: string
			path: string
		}
	},
	Promise<FolderModel>
>({
	onRequest: [ AssertSessionValid ],
	async handler(event) {
		const { repositoryId, path } = getRouterParams(event)
		const { context: { db, user } } = event
		const repository = await db
			.select({
				linkedFolder: FolderTable,
			})
			.from(UserVisibleRepositoryView)
			.innerJoin(FolderTable, eq(UserVisibleRepositoryView.repository.linkedFolderId, FolderTable.id))
			.where(and(
				eq(UserVisibleRepositoryView.user.id, user!.id),
				eq(UserVisibleRepositoryView.repository.id, repositoryId),
			))
			.limit(1)
			.then(last)

		if (!repository) {
			throw new BadRequestErrorWithI18n(i18n.error.repositoryNotExists)
		}
		const fullPath = join(repository.linkedFolder.fullPath, path)
		const folder = await db.query.FolderTable.findFirst({
			where: and(
				eq(FolderTable.repositoryId, repositoryId),
				eq(FolderTable.fullPath, fullPath),
			),
			with: {
				subFiles: true,
				subFolders: true,
			},
		})
		if (!folder) {
			throw new BadRequestErrorWithI18n(i18n.error.folderNotExists)
		}
		return {
			id: folder.id,
			name: folder.name,
			repositoryId: folder.repositoryId,
			fullPath: folder.fullPath,
			files: folder.subFiles.map(pick([ 'id', 'name' ])),
			folders: folder.subFolders.map(pick([ 'id', 'name' ])),
		}
	},
})
