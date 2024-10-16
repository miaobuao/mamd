import type { NatsConnection } from 'nats'
import { connect } from 'nats'
import config from './config'

let conn: NatsConnection

export async function useNatsConnection() {
	conn ??= await connect({
		servers: config.natsUrl,
	})
	return conn
}
