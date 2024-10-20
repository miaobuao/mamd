import { useMinioClient } from '~~/server/utils/minio.client'

export default defineEventHandler(async () => {
	const _minio = useMinioClient()
})
