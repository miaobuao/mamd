import { Buffer } from 'node:buffer'
import superjson from 'superjson'

export function serializeJson(json: object) {
	const str = superjson.stringify(json)
	return Buffer.from(str)
}

export function deserializeJson<T = any>(buffer: Buffer) {
	const str = buffer.toString()
	return superjson.parse<T>(str)
}
