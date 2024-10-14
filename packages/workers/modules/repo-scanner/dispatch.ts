import { usePrismaClient } from 'prisma-client-js'
import { useConnection } from '../connection'
import { serializeJson } from '../serializer'
import { MASTER_QUEUE } from './const'

const prisma = usePrismaClient()

export async function repositoryExists(repositoryId: string, repositoryPath: string) {
	const res = await prisma.repository.findUnique({
		where: {
			id: repositoryId,
			path: repositoryPath,
		},
		select: {
			id: true,
		},
	})
	return !!res
}

export default async function startScanRepository(repositoryId: string, repositoryPath: string) {
	if (!await repositoryExists(repositoryId, repositoryPath)) {
		return
	}
	const conn = await useConnection()
	const channel = await conn.createChannel()
	await channel.assertQueue(MASTER_QUEUE, {
		durable: false,
	})
	return channel.sendToQueue(MASTER_QUEUE, serializeJson({
		repositoryId,
		repositoryPath,
	}))
}
