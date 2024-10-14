import path from 'node:path'
import type { ConsumeMessage } from 'amqplib'
import { usePrismaClient } from 'prisma-client-js'
import { useConnection } from '../connection'
import { deserializeJson } from '../serializer'
import type { MasterConsumeContent } from './const'
import { MASTER_QUEUE } from './const'
import { directoryIterator } from './utils'

const db = usePrismaClient()

async function handler(msg: ConsumeMessage | null) {
	if (!msg)
		return
	const { repositoryId, repositoryPath } = deserializeJson<MasterConsumeContent>(msg.content)
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
	if (!linkedFolder) {
		// TODO: create linked folder
		return
	}
	let parentFolderId: string | null = null
	let parentFolderPath: string | null = null
	for await (const entry of directoryIterator(repositoryPath)) {
		const relativePath = path.posix.relative(repositoryPath, entry.parentPath)
		if (relativePath !== parentFolderPath) {
			const parts = relativePath.split(path.posix.sep)
			parentFolderId = await queryAlong(linkedFolder.id, parts)
			parentFolderPath = relativePath
		}
		if (entry.isDirectory()) {
			const folder = await db.folder.findFirst({
				where: {
					parentId: parentFolderId,
					name: entry.name,
				},
				select: {
					id: true,
				},
			})
			if (!folder) {
				await db.folder.create({
					data: {
						parentId: parentFolderId,
						name: entry.name,
						creatorId: repository.creatorId,
					},
				})
			}
		}
		else {
			const file = await db.file.findFirst({
				where: {
					parentId: parentFolderId,
					name: entry.name,
				},
				select: {
					id: true,
				},
			})
			if (!file) {
				await db.file.create({
					data: {
						parentId: parentFolderId,
						name: entry.name,
						creatorId: repository.creatorId,
					},
				})
			}
		}
	}
}

async function queryAlong(rootId: string, parts: string[]) {
	parts = [ ...parts ]
	while (parts.length > 0) {
		const part = parts.shift()!
		const root = await db.folder.findFirst({
			where: {
				parentId: rootId,
				name: part,
			},
			select: {
				id: true,
			},
		})
		rootId = root!.id
	}
	return rootId
}

useConnection()
	.then(conn => conn.createChannel())
	.then(async (channel) => {
		await channel.assertQueue(MASTER_QUEUE)
		channel.consume(MASTER_QUEUE, handler)
	})
