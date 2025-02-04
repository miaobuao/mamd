import * as fs from 'node:fs/promises'
import { consola } from 'consola'
import { FileMetadataTable, FileTable, FolderMetadataTable, useDrizzleClient } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { fileTypeFromBuffer } from 'file-type'
import { lookup as lookupMimeType } from 'mime-types'
import config from '../config'
import { bufferToHash } from '../utils'
import { type FileMetadataConsumeContent, fileMetadataTask, type FileTask, type FolderTask } from './task'

const db = useDrizzleClient(config.databaseUrl)

export async function startFileMetadataWorker() {
	for await (const content of fileMetadataTask.consume()) {
		handler(content)
			.catch(consola.error)
	}
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
		await db
			.delete(FileTable)
			.where(eq(FileTable.id, content.id))
		return
	}
	const buffer = await fs.readFile(content.path)
	const fileType = await fileTypeFromBuffer(buffer)
	const mimeType = fileType?.mime ?? lookupMimeType(content.path)
	if (!mimeType) {
		return
	}
	const hasher = await bufferToHash(buffer, 'sha256')
	const sha256 = hasher.digest('hex')
	const { mtime, birthtime } = fileStat
	await db.insert(FileMetadataTable).values({
		fileId: content.id,
		mtime,
		birthtime,
		size: fileStat.size,
		mimeType,
		sha256,
	}).onConflictDoUpdate({
		target: FileMetadataTable.fileId,
		set: {
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
	await db.insert(FolderMetadataTable).values({
		folderId: content.id,
		mtime,
		birthtime,
	}).onConflictDoUpdate({
		target: FolderMetadataTable.folderId,
		set: {
			mtime,
			birthtime,
		},
	})
}
