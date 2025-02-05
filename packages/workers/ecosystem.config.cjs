const os = require('node:os')
const process = require('node:process')

const isDev = process.env.NODE_ENV === 'development'
const watch = isDev ? [ 'dist' ] : undefined
module.exports = {
	apps: [
		{
			name: 'worker.multi',
			script: './dist/main.multi.js',
			env: {
				NATS_URL: process.env.NATS_URL,
				DATABASE_URL: process.env.DATABASE_URL,
			},
			watch,
			ignore_watch: [ 'node_modules', 'modules' ],
			instances: Math.min(1, os.cpus().length),
		},
		{
			name: 'worker.single',
			script: './dist/main.single.js',
			env: {
				NATS_URL: process.env.NATS_URL,
				DATABASE_URL: process.env.DATABASE_URL,
			},
			watch,
			ignore_watch: [ 'node_modules', 'modules' ],
		},
	],
}
