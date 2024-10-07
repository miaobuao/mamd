import { protectedProcedure, publicProcedure, router } from '../trpc'
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
				.catch(
					createPrismaErrorHandler({
						OperationFailedError() {
							throw new ForbiddenErrorWithI18n(
								i18n.error.invalidEmailOrPassword,
							)
						},
						default() {
							throw new ForbiddenErrorWithI18n(i18n.error.loginFailed)
						},
					}),
				)
			if (!user || !bcryptVerify(input.password, user.password))
				throw new ForbiddenErrorWithI18n(i18n.error.invalidEmailOrPassword)

			const token = await signToken({
				userId: user.id,
				remember: input.remember,
			})
			if (input.remember) {
				const maxAge = secs(config.OAUTH_JWT_EXPIRES_INd)
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

	register: publicProcedure
		.input(UserRegisterSubmitDataValidator)
		.mutation(async ({ input, ctx: { db } }) => {
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
								i18n.error.emailHasBeenRegistered,
							)
						},
						default() {
							throw new ForbiddenErrorWithI18n(i18n.error.registerFailed)
						},
					}),
				)
		}),
})
