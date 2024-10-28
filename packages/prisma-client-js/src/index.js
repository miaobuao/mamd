import { PrismaClient } from '@prisma/client'

export { PrismaClient } from '@prisma/client'

let client

export function usePrismaClient() {
	client ??= new PrismaClient()
	return client
}
