import { t } from '../trpc'

export const checkAdminAccountExists = t.middleware(async ({ ctx, next }) => {
	const hasAdmin = await ctx.db.basic.user.findFirst({
		where: { isAdmin: true },
		select: { id: true },
	}).then((user) => {
		return !!user
	})
	return next({
		ctx: {
			...ctx,
			hasAdmin,
		},
	})
})
