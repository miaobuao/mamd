import process from 'node:process'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	out: './migrations',
	schema: './schema',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
})
