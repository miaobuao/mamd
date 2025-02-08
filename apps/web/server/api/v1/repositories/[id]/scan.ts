import { scannerTask } from '@repo/workers'
import { RepositoryTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { AssertUserIsAdmin } from '../../middleware/assert-user-is-admin'

export default defineEventHandler({
	onRequest: [ AssertUserIsAdmin ],
	async handler(event) {
		const repositoryId = event.context.params!.id!
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
