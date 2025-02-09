import { scannerTask } from '@repo/workers'
import { RepositoryTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { AssertSessionValid } from '~~/server/api/v1/middleware/assert-session-valid'

export default defineEventHandler({
	onRequest: [ AssertSessionValid ],
	async handler(event) {
		const { repositoryId } = getRouterParams(event)
		const repository = await event.context.db.query.RepositoryTable.findFirst({
			where: eq(RepositoryTable.id, repositoryId),
			columns: {
				id: true,
			},
			with: {
				linkedFolder: true,
			},
		})
		if (!repository || !repository.linkedFolder) {
			throw new BadRequestErrorWithI18n(i18n.error.repositoryNotExists)
		}
		await scannerTask.publish({
			repositoryId: repository.id,
			repositoryPath: repository.linkedFolder.fullPath,
		})
	},
})
