import type { RepositoryWatcherConsumeContent } from './task'
import { dirname } from 'node:path'
import chokidar from 'chokidar'
import consola from 'consola'
import { RepositoryTable, useDrizzleClient } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { isNil } from 'lodash-es'
import { RepositoryFileSytem } from 'repository-fs'
import { Subject } from 'rxjs'
import config from '../config'
import { fileMetadataTask } from '../file-metadata/task'
import {

	repositoryWatcherStartTask,
	repositoryWatcherStopTask,
} from './task'

enum WorkerEvent {
	stop,
}

const events = new Subject<{
	repositoryId: string
	event: WorkerEvent
}>()

const db = useDrizzleClient(config.databaseUrl)

export async function startRepositoryWatcherWorker() {
	return await Promise.all([
		handleStartTask(),
		handleStopTask(),
	])
}

async function handleStartTask() {
	for await (const message of repositoryWatcherStartTask.consume()) {
		handler(message)
			.catch(consola.error)
	}
	async function handler({ repositoryId }: RepositoryWatcherConsumeContent) {
		const repositoryFs = new RepositoryFileSytem(db, repositoryId)
		const repository = await db.query.RepositoryTable.findFirst({
			where: eq(RepositoryTable.id, repositoryId),
			with: {
				linkedFolder: true,
			},
		})
		if (isNil(repository?.linkedFolder)) {
			return
		}
		consola.log('watch dir: ', repository.linkedFolder.fullPath)
		async function handleAddFile(path: string) {
			const parent = dirname(path)
			const parentFolder = await handleAddFolder(parent)
			if (parentFolder) {
				return repositoryFs.addFile(parentFolder.id, path)
			}
		}
		async function handleAddFolder(path: string): Promise<{ id: string } | undefined> {
			const folder = await repositoryFs.existDir(path)
			if (folder) {
				return folder
			}
			const parent = dirname(path)
			const parentFolder = await handleAddFolder(parent)
			if (parentFolder) {
				return await repositoryFs.addDir(parentFolder.id, path)
			}
		}

		const watcher = chokidar.watch(repository.linkedFolder.fullPath, {
			ignoreInitial: true,
		})
		watcher
			.on('all', (event, path) => {
				consola.log(event, path)
			})
			.on('add', async (path) => {
				const res = await handleAddFile(path)
				if (!res) {
					return
				}
				await fileMetadataTask.publish({
					isDir: false,
					id: res.id,
					path,
				})
			})
			.on('addDir', async (path) => {
				const res = await handleAddFolder(path)
				if (!res) {
					return
				}
				await fileMetadataTask.publish({
					isDir: true,
					id: res.id,
					path,
				})
			})
			.on('change', async (path) => {
				let file = await repositoryFs.existFile(path)
				if (!file) {
					await repositoryFs.removeDir(path)
					file = await handleAddFile(path)
				}
				if (!file) {
					return
				}
				await fileMetadataTask.publish({
					isDir: false,
					id: file.id,
					path,
				})
			})
			.on('unlink', async (path) => {
				await repositoryFs.removeFile(path)
			})
			.on('unlinkDir', async (path) => {
				await repositoryFs.removeDir(path)
			})
		const subscriber = events.subscribe({
			async next(value) {
				switch (value.event) {
					case WorkerEvent.stop:
						await watcher.close()
						subscriber.unsubscribe()
				}
			},
		})
	}
}

async function handleStopTask() {
	for await (const message of repositoryWatcherStopTask.consume()) {
		events.next({
			...message,
			event: WorkerEvent.stop,
		})
	}
}
