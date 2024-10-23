import { createWriteStream } from 'node:fs'
import path from 'node:path'
import { getFolderAbsolutePath } from '~~/server/utils/fs'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

const oss = useMinioClient()

export const ossRoute = router({
	assignUploadUrl: protectedProcedure
		.input(z.object({
			uuid: z.string().uuid(),
			chunkIdx: z.number().int(),
		}))
		.mutation(async ({ input: { uuid, chunkIdx } }) => {
			return oss.presignedPutObject(BUCKET.TMP_UPLOAD, `${uuid}/${chunkIdx}`, 10 * 60)
		}),
	uploadEnded: protectedProcedure
		.input(z.object({
			uuid: z.string().uuid(),
			fileName: z.string(),
			folderUuid: z.string().uuid(),
			repositoryUuid: z.string().uuid(),
		}))
		.mutation(async ({ input, ctx: { db } }) => {
			const list = oss.listObjects(BUCKET.TMP_UPLOAD, input.uuid, true)
			const dir = await getFolderAbsolutePath(db, { uuid: input.repositoryUuid }, { uuid: input.folderUuid })
			const writeStream = createWriteStream(
				path.resolve(dir, input.fileName),
			)
			for await (const item of list) {
				const obj = await oss.getObject(BUCKET.TMP_UPLOAD, item.name)
				obj.pipe(writeStream)
			}
		}),
})
