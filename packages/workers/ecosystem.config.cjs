const os = require('node:os')
const process = require('node:process')

const isDev = process.env.NODE_ENV === 'development'

module.exports = {
	apps: [
		{
			name: 'file-scanner',
			script: './modules/repo-scanner/worker.ts',
			interpreter: 'bun',
			env: {
				NATS_URL: process.env.NATS_URL,
				DATABASE_URL: process.env.DATABASE_URL,
			},
			watch: isDev,
			ignore_watch: [ 'node_modules' ],
		},
		{
			name: 'file-metadata',
			script: './modules/file-metadata/worker.ts',
			interpreter: 'bun',
			env: {
				NATS_URL: process.env.NATS_URL,
				DATABASE_URL: process.env.DATABASE_URL,
			},
			watch: isDev,
			ignore_watch: [ 'node_modules' ],
			instances: Math.min(2, os.cpus().length),
		},
	],
}
