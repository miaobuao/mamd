import { UserTable } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { t } from '../trpc'

export const checkAdminAccountExists = t.middleware(async ({ ctx, next }) => {
	const hasAdmin = await ctx.db.query.UserTable.findFirst({
		where: eq(UserTable.isAdmin, true),
		columns: {
			id: true,
		},
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
