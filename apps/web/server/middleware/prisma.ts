import { PrismaClient as PrismaClientBasic } from '@prisma-client/basic'

declare module 'h3' {
	interface H3EventContext {
		db: {
			basic: PrismaClientBasic
		}
	}
}

export default defineEventHandler(async ({ context }) => {
	context.db = {
		basic: new PrismaClientBasic(),
	}
})
