import * as fs from 'node:fs/promises'
import path from 'node:path'

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
