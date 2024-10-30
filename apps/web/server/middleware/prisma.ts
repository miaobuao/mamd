import type { PrismaClient } from 'prisma-client-js'
import { usePrismaClient } from 'prisma-client-js'

declare module 'h3' {
	interface H3EventContext {
		db: PrismaClient
	}
}

export default defineEventHandler(async ({ context }) => {
	context.db = usePrismaClient()
})
