import { UserTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { isNil } from 'lodash-es'
import { checkAdminAccountExists } from '../middleware/check-admin-user'
import { adminProcedure, protectedProcedure, publicProcedure, router } from '../trpc'

export const UserRouter = router({
	auth: protectedProcedure.mutation(async ({ ctx: { userInfo } }) => {
		return {
			uuid: userInfo.id,
			username: userInfo.username,
			isAdmin: userInfo.isAdmin,
		}
	}),

	login: publicProcedure
		.input(UserLoginSubmitFormValidator)
		.mutation(async ({ input, ctx: { db, event } }) => {
			const user = await db.query.UserTable.findFirst({
				where: eq(UserTable.username, input.username),
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
				const maxAge = secs(config.OAUTH_JWT_EXPIRES_IN)
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
				uuid: user.id,
				username: user.username,
				isAdmin: user.isAdmin,
			}
		}),

	logout: protectedProcedure.mutation(async ({ ctx: { event } }) => {
		setCookie(event, 'auth-token', '', {
			httpOnly: true,
			expires: new Date(0),
		})
	}),

	hasAdminAccount: publicProcedure.use(checkAdminAccountExists).query(async ({ ctx: { hasAdmin } }) => {
		return hasAdmin
	}),

	createAdminUser: publicProcedure
		.use(checkAdminAccountExists)
		.input(UserRegisterSubmitDataValidator)
		.mutation(async ({ input, ctx: { db, hasAdmin } }) => {
			if (hasAdmin) {
				throw new ForbiddenErrorWithI18n(i18n.error.adminAccountExists)
			}
			const hasSameUsername = await db.query.UserTable.findFirst({
				where: eq(UserTable.username, input.username),
			})
			if (hasSameUsername) {
				throw new ForbiddenErrorWithI18n(i18n.error.usernameHasBeenRegistered)
			}
			const hashPassword = await bcryptEncrypt(input.password)
			await db
				.insert(UserTable)
				.values({
					username: input.username,
					password: hashPassword,
					isAdmin: true,
				})
				.catch(() => {
					throw new ForbiddenErrorWithI18n(i18n.error.registerFailed)
				})
		}),

	createUser: adminProcedure
		.input(CreateUserInputValidator)
		.mutation(async ({ input, ctx: { db } }) => {
			const hasSameUsername = await db.query.UserTable.findFirst({
				where: eq(UserTable.username, input.username),
			})
			if (hasSameUsername) {
				throw new ForbiddenErrorWithI18n(i18n.error.usernameHasBeenRegistered)
			}
			const hashPassword = await bcryptEncrypt(input.password)
			await db
				.insert(UserTable)
				.values({
					username: input.username,
					password: hashPassword,
					isAdmin: input.isAdmin,
				})
				.catch(() => {
					throw new ForbiddenErrorWithI18n(i18n.error.registerFailed)
				})
		}),

	listUsers: adminProcedure
		.query(async ({ ctx: { db } }) => {
			return await db
				.query
				.UserTable
				.findMany({
					where: eq(UserTable.isDeleted, false),
					columns: {
						id: true,
						username: true,
						isAdmin: true,
						mtime: true,
						ctime: true,
					},
				})
		}),

	deleteUser: adminProcedure
		.input(DeleteUserInputValidator)
		.mutation(async ({ input, ctx: { db } }) => {
			await db.update(UserTable)
				.set({ isDeleted: true })
				.where(eq(UserTable.id, input.id))
		}),

	editUser: adminProcedure
		.input(EditUserInputValidator)
		.mutation(async ({ input, ctx: { db } }) => {
			await db.update(UserTable)
				.set({
					username: input.username,
					isAdmin: input.isAdmin,
					...(input.password ? { password: await bcryptEncrypt(input.password) } : {}),
				})
				.where(eq(UserTable.id, input.id))
		}),
})
