import process from 'node:process'

const config = {
	natsUrl: process.env.NATS_URL!,
	databaseUrl: process.env.DATABASE_URL!,
}

export default config
