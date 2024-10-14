const process = require('node:process')

const isDev = process.env.NODE_ENV === 'development'

module.exports = {
	apps: [
		{
			name: 'worker',
			script: './modules/repo-scanner/worker.ts',
			interpreter: 'bun',
			watch: isDev,
		},
	],
}
