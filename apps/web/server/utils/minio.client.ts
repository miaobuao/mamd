import { isNil } from 'lodash-es'
import * as Minio from 'minio'
import { config } from './config'

let minioClient: Minio.Client | undefined

export function useMinioClient() {
	if (isNil(minioClient)) {
		minioClient = new Minio.Client({
			endPoint: config.MINIO_ENDPOINT,
			port: config.MINIO_PORT,
			useSSL: config.MINIO_USE_SSL,
			accessKey: config.MINIO_ACCESS_KEY,
			secretKey: config.MINIO_SECRET_KEY,
		})
	}
	return minioClient
}
