const process = require('node:process')

const isDev = process.env.NODE_ENV === 'development'

module.exports = {
	apps: [
		{
			name: 'file-scanner',
			script: './modules/repo-scanner/scanner.worker.ts',
			interpreter: 'bun',
			env: {
				NATS_URL: process.env.NATS_URL,
			},
			watch: isDev,
		},
	],
}
