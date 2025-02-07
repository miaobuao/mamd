import { AUTH_TOKEN_KEY } from '~~/server/middleware/2.auth'

export default defineEventHandler(async (event) => {
	await deleteCookie(event, AUTH_TOKEN_KEY)
})
