import { t } from '../trpc'

export const checkAdminAccountExists = t.middleware(async ({ ctx, next }) => {
	const hasAdmin = await ctx.db.user.findFirst({
		where: {
			isAdmin: true,
			isDeleted: false,
		},
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
