import { config } from '~~/server/utils/config'
import { CreateUserInputValidator, DeleteUserInputValidator, EditUserInputValidator, UserLoginSubmitFormValidator, UserRegisterSubmitDataValidator } from '~/utils/validator'
import { checkAdminAccountExists } from '../middleware/check-admin-user'
import { adminProcedure, protectedProcedure, publicProcedure, router } from '../trpc'

export const UserRouter = router({
	auth: protectedProcedure.mutation(async ({ ctx: { userInfo } }) => {
		return {
			uuid: userInfo.uuid,
			username: userInfo.username,
			isAdmin: userInfo.isAdmin,
		}
	}),

	login: publicProcedure
		.input(UserLoginSubmitFormValidator)
		.mutation(async ({ input, ctx: { db, event } }) => {
			const user = await db.user
				.findUniqueOrThrow({
					where: { username: input.username },
					select: { uuid: true, username: true, password: true, isAdmin: true },
				})
				.catch(() => {
					throw new ForbiddenErrorWithI18n(i18n.error.loginFailed)
				})
			if (!user || !bcryptVerify(input.password, user.password))
				throw new ForbiddenErrorWithI18n(i18n.error.invalidUsernameOrPassword)

			const token = await signToken({
				user: {
					uuid: user.uuid,
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
				uuid: user.uuid,
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
			const hashPassword = await bcryptEncrypt(input.password)
			await db.user
				.create({
					data: {
						username: input.username,
						password: hashPassword,
						isAdmin: true,
					},
				})
				.catch(
					createPrismaErrorHandler({
						UniqueConstraintError() {
							throw new ForbiddenErrorWithI18n(
								i18n.error.usernameHasBeenRegistered,
							)
						},
						default() {
							throw new ForbiddenErrorWithI18n(i18n.error.registerFailed)
						},
					}),
				)
		}),

	createUser: adminProcedure
		.input(CreateUserInputValidator)
		.mutation(async ({ input, ctx: { db } }) => {
			const hashPassword = await bcryptEncrypt(input.password)
			await db.user
				.create({
					data: {
						username: input.username,
						password: hashPassword,
						isAdmin: input.isAdmin,
						// isDeleted: false,
					},
				})
				.catch(
					createPrismaErrorHandler({
						UniqueConstraintError() {
							throw new ForbiddenErrorWithI18n(
								i18n.error.usernameHasBeenRegistered,
							)
						},
						default() {
							throw new ForbiddenErrorWithI18n(i18n.error.registerFailed)
						},
					}),
				)
		}),

	listUsers: adminProcedure
		.query(async ({ ctx: { db } }) => {
			return await db.user.findMany({
				where: {
					isDeleted: false,
				},
			})
		}),

	deleteUser: adminProcedure
		.input(DeleteUserInputValidator)
		.mutation(async ({ input, ctx: { db } }) => {
			await db.user.update({
				where: {
					uuid: input.uuid,
				},
				data: {
					isDeleted: true,
					username: input.uuid,
				},
			})
		}),

	editUser: adminProcedure
		.input(EditUserInputValidator)
		.mutation(async ({ input, ctx: { db } }) => {
			if (input.password) {
				const hashPassword = await bcryptEncrypt(input.password)
				await db.user.update({
					where: {
						uuid: input.uuid,
					},
					data: {
						username: input.username,
						password: hashPassword,
						isAdmin: input.isAdmin,
					},
				})
			}
			else {
				await db.user.update({
					where: {
						uuid: input.uuid,
					},
					data: {
						username: input.username,
						isAdmin: input.isAdmin,
					},
				})
			}
		}),
})
