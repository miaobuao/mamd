import { protectedProcedure, publicProcedure, router } from '../trpc'
import { checkAdminAccountExists } from '../middleware/check-admin-user'
import { UserLoginSubmitFormValidator, UserRegisterSubmitDataValidator } from '~/utils/validator'

const config = useRuntimeConfig()

export const UserRouter = router({
	auth: protectedProcedure.mutation(async ({ ctx: { userInfo } }) => {
		return userInfo
	}),

	login: publicProcedure
		.input(UserLoginSubmitFormValidator)
		.mutation(async ({ input, ctx: { db, event } }) => {
			const user = await db.basic.user
				.findUniqueOrThrow({
					where: { username: input.username },
					select: { id: true, username: true, password: true },
				})
				.catch(() => {
					throw new ForbiddenErrorWithI18n(i18n.error.loginFailed)
				})
			if (!user || !bcryptVerify(input.password, user.password))
				throw new ForbiddenErrorWithI18n(i18n.error.invalidUsernameOrPassword)

			const token = await signToken({
				userId: user.id,
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
				id: user.id,
				username: user.username,
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
			await db.basic.user
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

	createCommonUser: protectedProcedure
		.input(UserRegisterSubmitDataValidator)
		.mutation(async ({ input, ctx: { db, userInfo } }) => {
			if (!userInfo.isAdmin) {
				throw new ForbiddenErrorWithI18n(i18n.error.permissionDenied)
			}
			const hashPassword = await bcryptEncrypt(input.password)
			await db.basic.user
				.create({
					data: {
						username: input.username,
						password: hashPassword,
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
})
