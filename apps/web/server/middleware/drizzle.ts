import { type DrizzleCilent, useDrizzleClient } from 'drizzle-client'

declare module 'h3' {
	interface H3EventContext {
		db: DrizzleCilent
	}
}

const config = useRuntimeConfig()
const db = useDrizzleClient(config.DATABASE_URL)

export default defineEventHandler(async ({ context }) => {
	context.db = db
})
