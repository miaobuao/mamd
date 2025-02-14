import { UserTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'

export default defineEventHandler<{}, Promise< {
	exists: boolean
}>>(async (event) => {
	const exists = await event.context.db.query.UserTable.findFirst({
		where: eq(UserTable.isAdmin, true),
		columns: {
			id: true,
		},
	}).then((user) => {
		return !!user
	})
	return { exists }
})
