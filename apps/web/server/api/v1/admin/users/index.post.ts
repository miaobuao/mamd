/**
 * call by admin to create new account
 */
import type { TypeOf } from 'zod'
import type { UserModel } from '~~/shared/models/v1/user'
import { UserTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { AssertUserIsAdmin } from '~~/server/api/v1/middleware/assert-user-is-admin'

export default defineEventHandler<
	{
		body: TypeOf<typeof CreateUserInputValidator>
	},
	Promise<UserModel>
>({
	// TODO: more granular permission control
	onRequest: [ AssertUserIsAdmin ],
	handler: async (event) => {
		const input = await readBody(event)
		const { context: { db } } = event
		const hasSameUsername = await db.query.UserTable.findFirst({
			where: eq(UserTable.username, input.username),
		})
		if (hasSameUsername) {
			throw new ForbiddenErrorWithI18n(i18n.error.usernameHasBeenRegistered)
		}
		const hashPassword = await bcryptEncrypt(input.password)
		const user = await db
			.insert(UserTable)
			.values({
				username: input.username,
				password: hashPassword,
				isAdmin: input.isAdmin,
			})
			.returning({
				id: UserTable.id,
				ctime: UserTable.ctime,
			})
			.then((d) => d.at(0)!)
			.catch(() => {
				throw new ForbiddenErrorWithI18n(i18n.error.registerFailed)
			})
		return {
			...user,
			username: input.username,
			isAdmin: input.isAdmin,
			isDeleted: false,
			ctime: user.ctime.valueOf(),
		}
	},
})
