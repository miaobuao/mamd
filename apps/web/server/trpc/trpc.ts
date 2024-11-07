import type { Context } from '~~/server/trpc/context'
import { initTRPC } from '@trpc/server'
import { isNil } from 'lodash-es'

export const t = initTRPC.context<Context>().create()

export const router = t.router

export const middleware = t.middleware

export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
	const { user } = ctx
	if (isNil(user))
		throw new UnauthorizedErrorWithI18n(i18n.pleaseLogIn)

	const userInfo = await ctx.db.user
		.findUniqueOrThrow({
			where: {
				uuid: user.uuid,
				isDeleted: false,
			},
			select: {
				id: true,
				uuid: true,
				isAdmin: true,
				username: true,
			},
		})
		.catch(() => {
			setCookie(ctx.event, 'auth-token', '', {
				httpOnly: true,
				expires: new Date(0),
			})
			throw new UnauthorizedErrorWithI18n(i18n.pleaseLogIn)
		})
	return next({ ctx: { ...ctx, userInfo } })
})

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	const { userInfo } = ctx
	if (!userInfo.isAdmin || !userInfo.isDeleted) {
		throw new ForbiddenErrorWithI18n(i18n.error.permissionDenied)
	}
	return next({ ctx })
})
