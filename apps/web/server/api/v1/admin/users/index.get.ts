import type { UserModel } from '~~/shared/models/v1/user'
import { AssertUserIsAdmin } from '../../middleware/assert-user-is-admin'

export default defineEventHandler<{}, Promise<UserModel[]>>({
	onRequest: [ AssertUserIsAdmin ],
	async handler(event) {
		const users = await event.context.db.query.UserTable.findMany({
			columns: {
				id: true,
				username: true,
				isAdmin: true,
				isDeleted: true,
				ctime: true,
			},
		})
		return users.map((user) => ({
			...user,
			ctime: user.ctime.valueOf(),
		}))
	},
})
