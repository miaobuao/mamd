const os = require('node:os')
const process = require('node:process')

const isDev = process.env.NODE_ENV === 'development'
const watch = isDev ? [ 'dist' ] : undefined
module.exports = {
	apps: [
		{
			name: 'file-scanner',
			script: './dist/repo-scanner/worker.js',
			env: {
				NATS_URL: process.env.NATS_URL,
				DATABASE_URL: process.env.DATABASE_URL,
			},
			watch,
			ignore_watch: [ 'node_modules' ],
		},
		{
			name: 'file-metadata',
			script: './dist/file-metadata/worker.js',
			env: {
				NATS_URL: process.env.NATS_URL,
				DATABASE_URL: process.env.DATABASE_URL,
			},
			watch,
			ignore_watch: [ 'node_modules' ],
			instances: Math.min(2, os.cpus().length),
		},
	],
}
