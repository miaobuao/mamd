import { StringCodec } from 'nats'
import { useNatsConnection } from '../nats'
import { SCANNER_SUBJECT } from './vars'

const sc = StringCodec()

export async function dispatchScannerTask(repositoryId: string, repositoryPath: string) {
	const conn = await useNatsConnection()
	const payload = {
		repositoryId,
		repositoryPath,
	}
	await conn.publish(SCANNER_SUBJECT, sc.encode(
		JSON.stringify(payload),
	))
}
