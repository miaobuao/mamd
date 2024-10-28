import { publicProcedure, router } from '../trpc'
import { fsRouter } from './fs'
import { ossRoute } from './oss'
import { RepositoryRouter } from './repository'
import { UserRouter } from './user'

export const appRouter = router({
	ping: publicProcedure.query(() => 'pong'),
	user: UserRouter,
	repository: RepositoryRouter,
	fs: fsRouter,
	oss: ossRoute,
})
export type AppRouter = typeof appRouter
