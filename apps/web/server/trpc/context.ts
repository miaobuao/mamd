import type { H3Event } from 'h3'
import { isNil } from 'lodash-es'

export async function createContext(event: H3Event) {
	const token = getCookie(event, 'auth-token')
	const decoded = token && (await verifyToken(token))
	if (decoded) {
		const { payload } = decoded
		if (
			payload.remember
			&& !isNil(payload.exp)
			&& payload.exp - Date.now() / 1000 < 3 * 24 * 60 * 60
		) {
			// re-sign token
			const token = await signToken(payload.data)
			setCookie(event, 'auth-token', token, {
				httpOnly: true,
				maxAge: secs(config.OAUTH_JWT_EXPIRES_IN),
			})
		}
		return {
			db: event.context.db,
			event,
			user: payload.data.user,
		}
	}
	return {
		db: event.context.db,
		event,
	}
}

export type Context = Awaited<ReturnType<typeof createContext>>
