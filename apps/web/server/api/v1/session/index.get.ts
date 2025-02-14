import { UserTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'

export const AUTH_TOKEN_KEY = 'auth-token'

export default defineEventHandler<{}, Promise<{
	id: string
	username: string
	isAdmin: boolean
}>>(async (event) => {
	const token = await getCookie(event, AUTH_TOKEN_KEY)

	const decoded = token && (await verifyToken(token))
	if (!decoded) {
		throw new BadRequestErrorWithI18n(i18n.error.sessionInvalid)
	}
	const { payload } = decoded
	if (!payload?.data?.user?.id) {
		deleteCookie(event, AUTH_TOKEN_KEY)
		throw new BadRequestErrorWithI18n(i18n.error.sessionInvalid)
	}
	const user = await event.context.db.query.UserTable.findFirst({
		where: eq(UserTable.id, payload.data.user.id),
		columns: {
			id: true,
			isAdmin: true,
			username: true,
		},
	})
	if (!user) {
		deleteCookie(event, AUTH_TOKEN_KEY)
		throw new BadRequestErrorWithI18n(i18n.error.sessionInvalid)
	}
	return user
})
