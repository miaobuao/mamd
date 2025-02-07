import { UserTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'

export default defineEventHandler<{}, Promise< {
	hasAdmin: boolean
}>>(async (event) => {
	const hasAdmin = await event.context.db.query.UserTable.findFirst({
		where: eq(UserTable.isAdmin, true),
		columns: {
			id: true,
		},
	}).then((user) => {
		return !!user
	})
	return { hasAdmin }
})
