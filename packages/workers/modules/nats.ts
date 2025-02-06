import type { NatsConnection } from 'nats'
import { connect, StringCodec } from 'nats'
import config from './config'

let conn: NatsConnection

export async function useNatsConnection() {
	conn ??= await connect({
		servers: config.natsUrl,
	})
	return conn
}

const sc = StringCodec()

export class NatsTask<T> {
	constructor(readonly subject: string, readonly queue?: string) {}

	async publish(payload: T) {
		const conn = await useNatsConnection()
		conn.publish(this.subject, sc.encode(JSON.stringify(payload)))
	}

	async subscribe() {
		const conn = await useNatsConnection()
		return conn.subscribe(this.subject, {
			queue: this.queue,
		})
	}

	async *consume() {
		const sub = await this.subscribe()
		for await (const msg of sub) {
			yield msg.json<T>()
		}
	}
}
