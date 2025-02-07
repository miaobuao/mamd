import { UserTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { isNil } from 'lodash-es'

declare module 'h3' {
	interface H3EventContext {
		user?: {
			id: string
			username: string
			isAdmin: boolean
		}
	}
}

export const AUTH_TOKEN_KEY = 'auth-token'

export default defineEventHandler(async (event) => {
	const token = await getCookie(event, AUTH_TOKEN_KEY)
	const decoded = token && (await verifyToken(token))
	if (!decoded) {
		return
	}
	const { payload } = decoded
	if (!payload?.data?.user?.id) {
		deleteCookie(event, AUTH_TOKEN_KEY)
		return
	}
	const user = await event.context.db.query.UserTable.findFirst({
		where: eq(UserTable.id, payload.data.user.id),
		columns: {
			id: true,
			isAdmin: true,
			username: true,
		},
	})
	event.context.user = user
	if (!user) {
		deleteCookie(event, AUTH_TOKEN_KEY)
		return
	}
	const config = useRuntimeConfig()
	// re-sign token
	if (
		payload.data.remember
		&& !isNil(payload.exp)
		&& payload.exp - Date.now() / 1000 < 3 * 24 * 60 * 60
	) {
		const token = await signToken(payload.data)
		setCookie(event, AUTH_TOKEN_KEY, token, {
			httpOnly: true,
			maxAge: secs(config.OAUTH_JWT_EXPIRES_IN),
		})
	}
})
