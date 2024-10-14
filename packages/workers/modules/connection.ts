import type { Connection } from 'amqplib'
import { connect } from 'amqplib'
import config from './config'

let conn: Connection

export async function useConnection() {
	conn ??= await connect(config.connectUrl)
	return conn
}
