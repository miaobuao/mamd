import { AUTH_TOKEN_KEY } from './index.get'

export default defineEventHandler(async (event) => {
	await deleteCookie(event, AUTH_TOKEN_KEY)
})
