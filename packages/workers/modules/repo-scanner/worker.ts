import type { ScannerConsumeContent } from './task'
import path, { dirname } from 'node:path'
import { consola } from 'consola'
import { FileTable, FolderTable, RepositoryTable, useDrizzleClient } from 'drizzle-client'
import { and, eq, or } from 'drizzle-orm'
import { isJunk } from 'junk'
import { isNil } from 'lodash-es'
import config from '../config'
import { fileMetadataTask } from '../file-metadata/task'
import { directoryIterator } from '../utils'
import { scannerTask } from './task'

const db = useDrizzleClient(config.databaseUrl)

export async function startRepositoryScannerWorker() {
	for await (const content of scannerTask.consume()) {
		handler(content)
			.catch(consola.error)
		removeRest(content.repositoryId)
			.catch(consola.error)
	}
}

async function removeRest(repositoryId: string) {
	const repository = await db.query.RepositoryTable.findFirst({
		where: eq(RepositoryTable.id, repositoryId),
		with: {
			folders: true,
			files: true,
			linkedFolder: true,
		},
	})
	if (!repository || !repository.linkedFolder)
		return
	const filesPathSet = new Set(repository.files.map((f) => f.fullPath))
	const foldersPathSet = new Set(repository.folders.map((f) => f.fullPath))
	foldersPathSet.delete(repository.linkedFolder.fullPath)
	for await (const entry of directoryIterator(repository.linkedFolder.fullPath)) {
		if (entry.isDir) {
			foldersPathSet.delete(entry.fullPath)
		}
		else {
			filesPathSet.delete(entry.fullPath)
		}
	}
	consola.log('delete files: ', filesPathSet)
	consola.log('delete folders: ', foldersPathSet)
	const filesPath = [ ...filesPathSet ]
	const foldersPath = [ ...foldersPathSet ]
	if (filesPath.length > 0) {
		await db.delete(FileTable)
			.where(and(
				eq(FileTable.repositoryId, repositoryId),
				or(...filesPath.map((path) => eq(FileTable.fullPath, path))),
			))
	}
	if (foldersPath.length > 0) {
		await db.delete(FolderTable)
			.where(and(
				eq(FolderTable.repositoryId, repositoryId),
				or(...foldersPath.values().map((path) => eq(FolderTable.fullPath, path))),
			))
	}
}

async function handler({ repositoryId, repositoryPath }: ScannerConsumeContent) {
	const repository = await db.query.RepositoryTable.findFirst({
		where: eq(RepositoryTable.id, repositoryId),
		with: {
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
				repositoryId,
			})
			.returning({ id: FolderTable.id })
		linkedFolderId = folder.id
	}
	fileMetadataTask.publish({
		isDir: true,
		id: linkedFolderId!,
		path: repositoryPath,
	})
	let parentFolderId = linkedFolderId!
	let parentFolderPath = ''
	for await (const entry of directoryIterator(repositoryPath)) {
		if (!entry.isDir && isJunk(path.basename(entry.fullPath))) {
			continue
		}
		const relativeParentPath = path.relative(repositoryPath, path.dirname(entry.fullPath))
		if (relativeParentPath !== parentFolderPath) {
			const parentFolder = await db.query.FolderTable.findFirst({
				where: and(
					eq(FolderTable.repositoryId, repositoryId),
					eq(FolderTable.fullPath, dirname(entry.fullPath)),
				),
				columns: {
					id: true,
				},
			})
			parentFolderId = parentFolder!.id
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
				isDir: true,
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
				isDir: false,
				id: file.id,
				path: entry.fullPath,
			})
		}
	}
}
