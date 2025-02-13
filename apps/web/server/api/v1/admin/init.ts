import type { TypeOf } from 'zod'
import { User } from 'drizzle-client'
import { eq } from 'drizzle-orm'

export default defineEventHandler<{
	body: TypeOf<typeof UserRegisterSubmitDataValidator>
}>(async (event) => {
	const input = await readBody(event)
	const { db } = event.context
	const hasAdmin = await db.query.User.findFirst({
		where: eq(User.isAdmin, true),
		columns: {
			id: true,
		},
	}).then((user) => {
		return !!user
	})
	if (hasAdmin) {
		throw new ForbiddenErrorWithI18n(i18n.error.adminAccountExists)
	}
	const hasSameUsername = await db.query.User.findFirst({
		where: eq(User.username, input.username),
	})
	if (hasSameUsername) {
		throw new ForbiddenErrorWithI18n(i18n.error.usernameHasBeenRegistered)
	}
	const hashPassword = await bcryptEncrypt(input.password)
	await db
		.insert(User)
		.values({
			username: input.username,
			password: hashPassword,
			isAdmin: true,
		})
		.catch(() => {
			throw new ForbiddenErrorWithI18n(i18n.error.registerFailed)
		})
})
