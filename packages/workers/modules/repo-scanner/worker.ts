import path from 'node:path'
import { usePrismaClient } from 'prisma-client-js'
import { fileMetadataTask } from '../file-metadata/task'
import { directoryIterator } from '../utils'
import { scannerTask } from './task'

const db = usePrismaClient()

for await (const content of scannerTask.consume()) {
	await handler(content)
}

export interface ScannerConsumeContent {
	repositoryId: number
	repositoryPath: string
}

async function handler({ repositoryId, repositoryPath }: ScannerConsumeContent) {
	const repository = await db.repository.findFirst({
		where: {
			id: repositoryId,
		},
		select: {
			linkedFolder: {
				select: {
					id: true,
				},
			},
			creatorId: true,
		},
	})
	if (!repository)
		return
	const { linkedFolder } = repository
	let linkedFolderId = linkedFolder?.id
	if (!linkedFolder) {
		const folder = await db.folder.create({
			data: {
				name: path.basename(repositoryPath),
				parentId: null,
				creatorId: repository.creatorId,
			},
		})
		linkedFolderId = folder.id
	}
	fileMetadataTask.publish({
		isFile: false,
		id: linkedFolderId!,
		path: repositoryPath,
	})
	let parentFolderId = linkedFolderId!
	let parentFolderPath = ''
	for await (const entry of directoryIterator(repositoryPath)) {
		const relativeParentPath = path.relative(repositoryPath, path.dirname(entry.fullPath))
		if (relativeParentPath !== parentFolderPath) {
			const parts = relativeParentPath.split(path.sep)
			parentFolderId = await queryFolder(linkedFolderId!, parts)
			parentFolderPath = relativeParentPath
		}
		const name = path.basename(entry.fullPath)
		if (entry.isDir) {
			const _folder = await db.folder.upsert({
				where: {
					repositoryId_parentId_name: {
						repositoryId,
						parentId: parentFolderId,
						name,
					},
				},
				update: {},
				create: {
					name,
					parentId: parentFolderId,
					repositoryId,
					creatorId: repository.creatorId,
				},
			})
			await fileMetadataTask.publish({
				isFile: false,
				id: _folder.id,
				path: entry.fullPath,
			})
		}
		else {
			const _file = await db.file.upsert({
				where: {
					repositoryId_parentId_name: {
						repositoryId,
						parentId: parentFolderId,
						name,
					},
				},
				update: {},
				create: {
					repositoryId,
					parentId: parentFolderId,
					creatorId: repository.creatorId,
					name,
				},
			})
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
		const root = await db.folder.findFirst({
			where: {
				parentId: rootFolderId,
				name: part,
			},
			select: {
				id: true,
			},
		})
		rootFolderId = root!.id
	}
	return rootFolderId
}
