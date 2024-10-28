import { createReadStream } from 'node:fs'
import * as fs from 'node:fs/promises'
import { Readable } from 'node:stream'
import { consola } from 'consola'
import { fileTypeFromStream } from 'file-type'
import { usePrismaClient } from 'prisma-client-js'
import { readableToHash } from '../utils'
import { type FileMetadataConsumeContent, fileMetadataTask, type FileTask, type FolderTask } from './task'

const db = usePrismaClient()

for await (const content of fileMetadataTask.consume()) {
	handler(content)
		.catch(consola.error)
}

export async function handler(content: FileMetadataConsumeContent) {
	if (content.isFile) {
		await handleFile(content)
	}
	else {
		await handleFolder(content)
	}
}

async function handleFile(content: FileTask) {
	const fileStat = await fs.stat(content.path)
	if (!fileStat.isFile()) {
		await db.file.delete({
			where: {
				id: content.id,
			},
		})
		return
	}
	const fileType = await fileTypeFromStream(
		Readable.toWeb(
			createReadStream(content.path),
		),
	)
	if (!fileType) {
		return
	}
	const mimeType = fileType.mime
	const hasher = await readableToHash(createReadStream(content.path), 'sha256')
	const sha256 = hasher.digest()
	const { mtime, birthtime } = fileStat
	await db.fileMetadata.upsert({
		where: {
			fileId: content.id,
		},
		update: {
			mtime,
			birthtime,
			size: fileStat.size,
			mimeType,
			sha256,
		},
		create: {
			fileId: content.id,
			mtime,
			birthtime,
			size: fileStat.size,
			mimeType,
			sha256,
		},
	})
}

async function handleFolder(content: FolderTask) {
	const { mtime, birthtime } = await fs.lstat(content.path)
	await db.folderMetadata.upsert({
		where: {
			folderId: content.id,
		},
		update: {
			mtime,
			birthtime,
		},
		create: {
			folderId: content.id,
			mtime,
			birthtime,
		},
	})
}
