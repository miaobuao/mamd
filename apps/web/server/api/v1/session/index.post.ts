import type { TypeOf } from 'zod'
import { User } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { isNil } from 'lodash-es'

export default defineEventHandler<
	{
		body: TypeOf<typeof UserLoginSubmitFormValidator>
	},
	Promise<{
		id: string
		isAdmin: boolean
		username: string
	}>
>(async (event) => {
	const input = await readBody(event)
	const user = await event.context.db.query.User.findFirst({
		where: eq(User.username, input.username),
		columns: {
			id: true,
			isAdmin: true,
			username: true,
			password: true,
		},
	})
	if (isNil(user)) {
		throw new ForbiddenErrorWithI18n(i18n.error.loginFailed)
	}
	if (!user || !bcryptVerify(input.password, user.password)) {
		throw new ForbiddenErrorWithI18n(i18n.error.invalidUsernameOrPassword)
	}
	const token = await signToken({
		user: {
			id: user.id,
		},
		remember: input.remember,
	})
	if (input.remember) {
		const maxAge = secs(useRuntimeConfig().OAUTH_JWT_EXPIRES_IN)
		setCookie(event, 'auth-token', token, {
			httpOnly: true,
			maxAge,
		})
	}
	else {
		setCookie(event, 'auth-token', token, {
			httpOnly: true,
		})
	}
	return {
		id: user.id,
		username: user.username,
		isAdmin: user.isAdmin,
	}
})
