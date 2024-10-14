import type { ConsumeMessage } from 'amqplib'
import { useConnection } from '../connection'
import { MASTER_QUEUE } from './const'

async function handler(msg: ConsumeMessage | null) {
	if (!msg)
		return msg
}

useConnection()
	.then(conn => conn.createChannel())
	.then(async (channel) => {
		await channel.assertQueue(MASTER_QUEUE)
		channel.consume(MASTER_QUEUE, handler)
	})
