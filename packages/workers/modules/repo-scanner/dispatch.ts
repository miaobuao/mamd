import type { ScannerConsumeContent } from './scanner.worker'
import { StringCodec } from 'nats'
import { useNatsConnection } from '../nats'
import { SCANNER_SUBJECT } from './vars'

const sc = StringCodec()

export async function dispatchFolderScannerTask(payload: ScannerConsumeContent) {
	const conn = await useNatsConnection()
	await conn.publish(SCANNER_SUBJECT, sc.encode(
		JSON.stringify(payload),
	))
}
