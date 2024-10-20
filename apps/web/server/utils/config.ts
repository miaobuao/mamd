import process from 'node:process'
import { isBoolean, isInteger } from 'lodash-es'

export const config = {
	// JWT
	JWT_SECRET: process.env.JWT_SECRET!,
	JWT_ISSUER: process.env.JWT_ISSUER!,
	OAUTH_JWT_EXPIRES_IN: process.env.OAUTH_JWT_EXPIRES_IN!,

	// MINIO
	MINIO_ENDPOINT: process.env.MINIO_ENDPOINT!,
	MINIO_PORT: isInteger(process.env.MINIO_PORT) ? Number.parseInt(process.env.MINIO_PORT!) : undefined,
	MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY!,
	MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY!,
	MINIO_USE_SSL: isBoolean(process.env.MINIO_USE_SSL) ? process.env.MINIO_USE_SSL === 'true' : undefined,
}