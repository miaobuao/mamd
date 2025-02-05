import chokidar from 'chokidar'
import consola from 'consola'
import { RepositoryTable, useDrizzleClient } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { isNil } from 'lodash-es'
import { Subject } from 'rxjs'
import config from '../config'
import {
	type RepositoryWatcherConsumeContent,

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
		const repository = await db.query.RepositoryTable.findFirst({
			where: eq(RepositoryTable.id, repositoryId),
			with: {
				linkedFolder: true,
			},
		})
		if (isNil(repository?.linkedFolder)) {
			return
		}
		const watcher = chokidar.watch(repository.linkedFolder.fullPath, {
			ignoreInitial: true,
		})
		watcher.on('link', (path) => {
			consola.info(`link: ${path}`)
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
