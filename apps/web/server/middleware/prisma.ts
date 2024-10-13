import { PrismaClient } from '@prisma/client'

declare module 'h3' {
	interface H3EventContext {
		db: PrismaClient
	}
}

export default defineEventHandler(async ({ context }) => {
	context.db = new PrismaClient()
})
