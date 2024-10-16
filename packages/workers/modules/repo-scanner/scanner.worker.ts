import path from 'node:path'
import { usePrismaClient } from 'prisma-client-js'
import { useNatsConnection } from '../nats'
import { directoryIterator } from '../utils'
import { SCANNER_QUEUE_NAME, SCANNER_SUBJECT } from './vars'

useNatsConnection()
	.then(conn =>
		conn.subscribe(SCANNER_SUBJECT, {
			queue: SCANNER_QUEUE_NAME,
		}),
	)
	.then(async (sub) => {
		for await (const msg of sub) {
			const content = msg.json<ScannerConsumeContent>()
			await handler(content)
		}
	})

const db = usePrismaClient()

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
	let parentFolderId: number | null = null
	let parentFolderPath: string | null = null
	for await (const entry of directoryIterator(repositoryPath)) {
		const relativePath = path.relative(repositoryPath, path.dirname(entry.fullPath))
		if (relativePath !== parentFolderPath) {
			const parts = relativePath.split(path.sep)
			parentFolderId = await queryFolder(linkedFolderId!, parts)
			parentFolderPath = relativePath
		}
		if (entry.isDir) {
			const folder = await db.folder.findFirst({
				where: {
					parentId: parentFolderId,
				},
				select: {
					id: true,
				},
			})
			if (!folder) {
				const _folder = await db.folder.create({
					data: {
						name: path.basename(entry.fullPath),
						parentId: parentFolderId,
						creatorId: repository.creatorId,
					},
				})
			}
		}
		else {
			const file = await db.file.findFirst({
				where: {
					parentId: parentFolderId,
					name: path.basename(entry.fullPath),
				},
				select: {
					id: true,
				},
			})
			if (!file) {
				const _file = await db.file.create({
					data: {
						parentId: parentFolderId,
						creatorId: repository.creatorId,
						name: path.basename(entry.fullPath),
					},
				})
			}
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
