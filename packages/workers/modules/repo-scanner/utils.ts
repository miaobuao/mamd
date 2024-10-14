import * as fs from 'node:fs/promises'
import path from 'node:path'

export async function* directoryIterator(dir: string) {
	const stack: string[] = [ dir ]
	while (stack.length > 0) {
		const currentDir = stack.pop()!
		const entries = await fs.readdir(currentDir, { withFileTypes: true })
		for (const entry of entries) {
			const fullPath = path.join(currentDir, entry.name)
			if (entry.isDirectory()) {
				stack.push(fullPath)
				yield entry
			}
			else {
				yield entry
			}
		}
	}
}
