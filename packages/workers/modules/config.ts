import process from 'node:process'

const config = {
	connectUrl: process.env.RABBITMQ_URL!,
}
export default config
