import { publicProcedure, router } from '../trpc'
import { RepositoryRouter } from './repository'
import { UserRouter } from './user'

export const appRouter = router({
	ping: publicProcedure.query(() => 'pong'),
	user: UserRouter,
	repository: RepositoryRouter,
})
export type AppRouter = typeof appRouter
