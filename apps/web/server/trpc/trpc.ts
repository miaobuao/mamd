import type { Context } from '~~/server/trpc/context'
import { initTRPC } from '@trpc/server'
import { UserTable } from 'drizzle-client'
import { and, eq } from 'drizzle-orm'
import { isNil } from 'lodash-es'

export const t = initTRPC.context<Context>().create()

export const router = t.router

export const middleware = t.middleware

export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
	const { user } = ctx
	if (isNil(user))
		throw new UnauthorizedErrorWithI18n(i18n.pleaseLogIn)
	const userInfo = await ctx.db.query.UserTable.findFirst({
		where: and(
			eq(UserTable.id, user.id),
			eq(UserTable.isDeleted, false),
		),
		columns: {
			id: true,
			isAdmin: true,
			username: true,
		},
	})
	if (isNil(userInfo)) {
		setCookie(ctx.event, 'auth-token', '', {
			httpOnly: true,
			expires: new Date(0),
		})
		throw new UnauthorizedErrorWithI18n(i18n.pleaseLogIn)
	}
	return next({ ctx: { ...ctx, userInfo, user: user! } })
})

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	const { userInfo } = ctx
	if (!userInfo.isAdmin) {
		throw new ForbiddenErrorWithI18n(i18n.error.permissionDenied)
	}
	return next({ ctx })
})
