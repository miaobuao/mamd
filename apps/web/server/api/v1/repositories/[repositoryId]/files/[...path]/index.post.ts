import { createWriteStream } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { fileMetadataTask } from '@repo/workers'
import { FileTable, FolderTable, UserVisibleRepositoryView } from 'drizzle-client'
import { and, eq } from 'drizzle-orm'
import { last } from 'lodash-es'
import { AssertUserIsAdmin } from '~~/server/api/v1/middleware/assert-user-is-admin'

export default defineEventHandler<
	{
		routerParams: {
			id: string
			path: string
		}
	}
>({
	// TODO: acl
	onRequest: [ AssertUserIsAdmin ],
	async handler(event) {
		let { repositoryId, path } = getRouterParams(event)
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
		path = resolve(repository.linkedFolder.fullPath, path)
		const file = await db.query.FileTable.findFirst({
			where: and(
				eq(FileTable.repositoryId, repositoryId),
				eq(FileTable.fullPath, path),
			),
			columns: {
				id: true,
			},
		})
		if (file) {
			throw new BadRequestErrorWithI18n(i18n.error.fileAlreadyExists)
		}
		const writeStream = createWriteStream(
			path,
			{
				flags: 'r+',
			},
		)
		await pipeline(event.node.req, writeStream)
		writeStream.close()
		let parentId = repository.linkedFolder.id
		const parent = dirname(path)
		if (parent !== repository.linkedFolder.fullPath) {
			const folder = await db.query.FolderTable.findFirst({
				where: and(
					eq(FolderTable.repositoryId, repositoryId),
					eq(FolderTable.fullPath, parent),
				),
				columns: {
					id: true,
				},
			})
			if (!folder) {
				throw new BadRequestErrorWithI18n(i18n.error.folderNotExists)
			}
			parentId = folder.id
		}
		const [ insertRes ] = await db.insert(FileTable).values({
			name: basename(path),
			fullPath: path,
			creatorId: user?.id,
			repositoryId,
			parentId,
		}).returning({ id: FileTable.id })
		await fileMetadataTask.publish({
			id: insertRes.id,
			isDir: false,
			path,
		})
	},
})
