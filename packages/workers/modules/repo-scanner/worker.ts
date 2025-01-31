import path from 'node:path'
import { consola } from 'consola'
import { FileTable, FolderTable, RepositoryTable, useDrizzleClient } from 'drizzle-client'
import { and, eq } from 'drizzle-orm'
import config from '../config'
import { fileMetadataTask } from '../file-metadata/task'
import { directoryIterator } from '../utils'
import { type ScannerConsumeContent, scannerTask } from './task'

const db = useDrizzleClient(config.databaseUrl)

for await (const content of scannerTask.consume()) {
	handler(content)
		.catch(consola.error)
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
		const relativeParentPath = path.relative(repositoryPath, path.dirname(entry.fullPath))
		if (relativeParentPath !== parentFolderPath) {
			const parts = relativeParentPath.split(path.sep)
			parentFolderId = await queryFolder(linkedFolderId!, parts)
			parentFolderPath = relativeParentPath
		}
		const name = path.basename(entry.fullPath)
		if (entry.isDir) {
			const [ _folder ] = await db.insert(FolderTable)
				.values({
					name,
					parentId: parentFolderId,
					repositoryId,
					creatorId: repository.creatorId,
				})
				.onConflictDoNothing()
				.returning({ id: FolderTable.id })
			await fileMetadataTask.publish({
				isFile: false,
				id: _folder.id,
				path: entry.fullPath,
			})
		}
		else {
			const [ _file ] = await db.insert(FileTable).values({
				repositoryId,
				parentId: parentFolderId,
				creatorId: repository.creatorId,
				name,
			}).onConflictDoNothing().returning({ id: FileTable.id })
			await fileMetadataTask.publish({
				isFile: true,
				id: _file.id,
				path: entry.fullPath,
			})
		}
	}
}

export async function queryFolder(rootFolderId: number, parts: string[]) {
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
