import pLimit from 'p-limit'
import { putObject } from './oss'

export function sliceFile(file: File, count: number) {
	const chunks: Blob[] = []
	const fileSize = file.size
	let offset = 0
	const chunkSize = Math.floor(fileSize / count)
	for (let i = 1; i < count; i++) {
		chunks.push(file.slice(offset, offset + chunkSize))
		offset += chunkSize
	}
	chunks.push(file.slice(offset, fileSize))
	return chunks
}

export class SingleFileUploader {
	private readonly limit = pLimit(10)

	constructor(
		private readonly file: File,
		private readonly chunkCount: number,
		private readonly assignUploadUrl: (idx: number) => Promise<string>,
	) {}

	async start() {
		const chunks = sliceFile(this.file, this.chunkCount)
		const presignedUrls = await Promise.all(
			chunks
				.map((_, idx) => () => this.assignUploadUrl(idx))
				.map(this.limit),
		)
		await Promise.all(chunks.map((blob, idx) => {
			const file = new File([ blob ], `${idx}`)
			return this.limit(() => putObject(presignedUrls[idx]!, file))
		}))
	}
}
