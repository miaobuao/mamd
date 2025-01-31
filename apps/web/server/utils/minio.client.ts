import { isNil } from 'lodash-es'
import * as Minio from 'minio'

let minioClient: Minio.Client | undefined

export function useMinioClient() {
	if (isNil(minioClient)) {
		const config = useRuntimeConfig()
		minioClient = new Minio.Client({
			endPoint: config.MINIO_ENDPOINT,
			port: config.MINIO_API_PORT,
			useSSL: config.MINIO_USE_SSL,
			accessKey: config.MINIO_ACCESS_KEY,
			secretKey: config.MINIO_SECRET_KEY,
		})
	}
	return minioClient
}

export const BUCKET = {
	TMP_UPLOAD: 'tmp-upload',
}

Object.keys(BUCKET).forEach((k) => {
	const client = useMinioClient()
	const name = BUCKET[k as keyof typeof BUCKET]
	client.bucketExists(name).then((exists) => {
		if (!exists) {
			client.makeBucket(name)
		}
	})
})
