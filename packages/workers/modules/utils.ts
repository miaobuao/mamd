import type { Readable } from 'node:stream'
import { Buffer } from 'node:buffer'
import { createHash, type Hash } from 'node:crypto'
import * as fs from 'node:fs/promises'
import path from 'node:path'
import superjson from 'superjson'

export interface DirectoryEntry {
	fullPath: string
	isDir: boolean
}

export async function* directoryIterator(dir: string): AsyncGenerator<DirectoryEntry> {
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

export async function * asyncChunk<T>(arr: Iterable<T>, chunkSize: number): AsyncGenerator<T[]> {
	let result: T[] = []
	for (const item of arr) {
		result.push(item)
		if (result.length === chunkSize) {
			yield result
			result = []
		}
	}
	if (result.length > 0) {
		yield result
	}
}

export function readableToHash(stream: Readable, alg: string): Promise<Hash> {
	const hasher = createHash(alg)
	stream.pipe(hasher)
	return new Promise<Hash>((resolve, reject) => {
		stream.on('end', () => {
			hasher.end()
			resolve(hasher)
		})
		stream.on('error', reject)
	})
}

export function bufferToHash(buffer: Buffer, alg: string): Hash {
	const hasher = createHash(alg)
	hasher.end(buffer)
	return hasher
}
