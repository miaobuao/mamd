import { PrismaClient } from '@prisma/client'

export { PrismaClient } from '@prisma/client'

const client = new PrismaClient()

export function usePrismaClient() {
	return client
}
