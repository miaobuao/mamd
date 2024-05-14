import { publicProcedure, router } from '../trpc'
import { UserRouter } from './user'

export const appRouter = router({
	ping: publicProcedure.query(() => 'pong'),
	user: UserRouter,
})
export type AppRouter = typeof appRouter
