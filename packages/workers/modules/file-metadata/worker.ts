import * as fs from 'node:fs/promises'
import { usePrismaClient } from 'prisma-client-js'
import { fileMetadataTask } from './task'

interface FileTask {
	isFile: true
	id: number
	path: string
}

interface FolderTask {
	isFile: false
	id: number
	path: string
}
export type FileMetadataConsumeContent = FileTask | FolderTask

const db = usePrismaClient()

for await (const content of fileMetadataTask.consume()) {
	await handler(content)
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
	const file = await fs.stat(content.path)
	const { mtime, birthtime } = file
	await db.fileMetadata.upsert({
		where: {
			fileId: content.id,
		},
		update: {
			mtime,
			birthtime,
		},
		create: {
			fileId: content.id,
			mtime,
			birthtime,
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
