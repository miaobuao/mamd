import type { BucketItem } from 'minio'
import { createWriteStream } from 'node:fs'
import * as fs from 'node:fs/promises'
import path, { basename } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { fileMetadataTask } from '@repo/workers'
import { FileTable } from 'drizzle-client'
import pLimit from 'p-limit'
import { z } from 'zod'
import { getFolderAbsolutePath } from '~~/server/utils/fs'
import { protectedProcedure, router } from '../trpc'

const oss = useMinioClient()

export const ossRoute = router({
	assignUploadUrl: protectedProcedure
		.input(z.object({
			uuid: z.string().uuid(),
			chunkIdx: z.number().int(),
		}))
		.mutation(async ({ input: { uuid, chunkIdx } }) => {
			const signedUrl = await oss.presignedPutObject(BUCKET.TMP_UPLOAD, `${uuid}/${chunkIdx}`, 10 * 60)
			return config.MINIO_PROXY_PATH + removeOriginInUrl(signedUrl)
		}),
	uploadEnded: protectedProcedure
		.input(z.object({
			uuid: z.string().uuid(),
			fileName: z.string(),
			folderUuid: z.string().uuid(),
			repositoryUuid: z.string().uuid(),
		}))
		.mutation(async ({ input, ctx: { db, userInfo } }) => {
			const dir = await getFolderAbsolutePath(db, input.repositoryUuid, input.folderUuid)
			const filePath = path.resolve(dir, input.fileName)
			const items = await oss.listObjects(BUCKET.TMP_UPLOAD, input.uuid, true)
				.toArray()
				.then((arr) => arr.map((item: BucketItem) => ({
					idx: Number.parseInt(item.name!.split('/').at(-1)!),
					size: item.size,
					name: item.name,
					item,
				})).sort((a, b) => a.idx - b.idx))
			await fs.open(filePath, 'a').then((file) => file.close())
			// TODO: configurable limit
			const limit = pLimit(12)
			const tasks = []
			let offset = 0
			for await (const item of items) {
				const obj = await oss.getObject(BUCKET.TMP_UPLOAD, item.name!)
				const writeStream = createWriteStream(
					filePath,
					{
						flags: 'r+',
						start: offset,
					},
				)
				offset += item.size
				tasks.push(limit(() => pipeline(obj, writeStream)))
			}
			await Promise.all(tasks)
			await Promise.all(
				items.map((item) => oss.removeObject(BUCKET.TMP_UPLOAD, item.name!)),
			)
			const [ insertRes ] = await db.insert(FileTable).values({
				name: basename(input.fileName),
				fullPath: filePath,
				creatorId: userInfo.id,
				repositoryId: input.repositoryUuid,
				parentId: input.folderUuid,
			}).returning({ id: FileTable.id })
			await fileMetadataTask.publish({
				id: insertRes.id,
				isDir: false,
				path: filePath,
			})
		}),
})
