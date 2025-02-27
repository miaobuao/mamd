import type { DrizzleCilent } from 'drizzle-client'
import { useDrizzleClient } from 'drizzle-client'

declare module 'h3' {
	interface H3EventContext {
		db: DrizzleCilent
	}
}

const db = useDrizzleClient(config.DATABASE_URL)

export default defineEventHandler(async ({ context }) => {
	context.db = db
})
