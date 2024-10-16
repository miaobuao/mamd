import { Buffer } from 'node:buffer'
import * as fs from 'node:fs/promises'

import path from 'node:path'
import superjson from 'superjson'

export async function* directoryIterator(dir: string) {
	const stack: string[] = [ dir ]
	while (stack.length > 0) {
		const currentDir = stack.pop()!
		let entries
		try {
			entries = await fs.readdir(currentDir, { withFileTypes: true })
		}
		catch {
			continue
		}
		for (const entry of entries) {
			const fullPath = path.join(currentDir, entry.name)
			const isDir = entry.isDirectory()
			if (isDir) {
				stack.push(fullPath)
			}
			yield { fullPath, isDir }
		}
	}
}

export function serializeJson(json: object) {
	const str = superjson.stringify(json)
	return Buffer.from(str)
}

export function deserializeJson<T = any>(buffer: Buffer) {
	const str = buffer.toString()
	return superjson.parse<T>(str)
}
