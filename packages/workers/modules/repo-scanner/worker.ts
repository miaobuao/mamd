import path from 'node:path'
import { consola } from 'consola'
import { FileTable, FolderTable, RepositoryTable, useDrizzleClient } from 'drizzle-client'
import { and, eq } from 'drizzle-orm'
import { isJunk } from 'junk'
import { isNil } from 'lodash-es'
import config from '../config'
import { fileMetadataTask } from '../file-metadata/task'
import { directoryIterator } from '../utils'
import { type ScannerConsumeContent, scannerTask } from './task'

const db = useDrizzleClient(config.databaseUrl)

export async function startRepositoryScannerWorker() {
	for await (const content of scannerTask.consume()) {
		handler(content)
			.catch(consola.error)
	}
}

async function handler({ repositoryId, repositoryPath, basePath }: ScannerConsumeContent) {
	const repository = await db.query.RepositoryTable.findFirst({
		where: eq(RepositoryTable.id, repositoryId),
		with: {
			folders: true,
			linkedFolder: true,
		},
	})
	if (!repository)
		return
	const { linkedFolder } = repository
	let linkedFolderId = linkedFolder?.id
	if (!linkedFolder) {
		const [ folder ] = await db.insert(FolderTable)
			.values({
				name: path.basename(repositoryPath),
				parentId: null,
				fullPath: repositoryPath,
				creatorId: repository.creatorId,
			})
			.returning({ id: FolderTable.id })
		linkedFolderId = folder.id
	}
	fileMetadataTask.publish({
		isFile: false,
		id: linkedFolderId!,
		path: repositoryPath,
	})
	let parentFolderId = linkedFolderId!
	let parentFolderPath = ''
	for await (const entry of directoryIterator(basePath ?? repositoryPath)) {
		if (!entry.isDir && isJunk(path.basename(entry.fullPath))) {
			continue
		}
		const relativeParentPath = path.relative(repositoryPath, path.dirname(entry.fullPath))
		if (relativeParentPath !== parentFolderPath) {
			const parts = relativeParentPath.split(path.sep)
			parentFolderId = await queryFolder(linkedFolderId!, parts)
			parentFolderPath = relativeParentPath
		}
		const name = path.basename(entry.fullPath)
		if (entry.isDir) {
			let [ folder ] = await db.insert(FolderTable)
				.values({
					name,
					parentId: parentFolderId,
					repositoryId,
					fullPath: entry.fullPath,
					creatorId: repository.creatorId,
				})
				.onConflictDoNothing()
				.returning({ id: FolderTable.id })
			if (isNil(folder)) {
				const _folder = await db.query.FolderTable.findFirst({
					where: and(
						eq(FolderTable.repositoryId, repositoryId),
						eq(FolderTable.parentId, parentFolderId),
						eq(FolderTable.name, name),
					),
					columns: {
						id: true,
					},
				})
				if (!_folder) {
					continue
				}
				folder = _folder
			}
			await fileMetadataTask.publish({
				isFile: false,
				id: folder.id,
				path: entry.fullPath,
			})
		}
		else {
			let [ file ] = await db.insert(FileTable).values({
				repositoryId,
				parentId: parentFolderId,
				fullPath: entry.fullPath,
				creatorId: repository.creatorId,
				name,
			}).onConflictDoNothing().returning({ id: FileTable.id })
			if (isNil(file)) {
				const _file = await db.query.FileTable.findFirst({
					where: and(
						eq(FileTable.repositoryId, repositoryId),
						eq(FileTable.parentId, parentFolderId),
						eq(FileTable.name, name),
					),
					columns: {
						id: true,
					},
				})
				if (!_file) {
					continue
				}
				file = _file
			}
			await fileMetadataTask.publish({
				isFile: true,
				id: file.id,
				path: entry.fullPath,
			})
		}
	}
}

export async function queryFolder(rootFolderId: string, parts: string[]) {
	parts = [ ...parts ]
	while (parts.length > 0) {
		const part = parts.shift()!
		const root = await db.query.FolderTable.findFirst({
			where: and(
				eq(FolderTable.parentId, rootFolderId),
				eq(FolderTable.name, part),
			),
		})
		rootFolderId = root!.id
	}
	return rootFolderId
}
