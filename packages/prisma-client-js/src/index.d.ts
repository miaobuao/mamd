import type { PrismaClient } from '@prisma/client'

export { PrismaClient } from '@prisma/client'

export function usePrismaClient(): PrismaClient
