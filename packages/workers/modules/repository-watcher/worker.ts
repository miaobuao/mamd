import chokidar from 'chokidar'
import consola from 'consola'
import { RepositoryTable, useDrizzleClient } from 'drizzle-client'
import { eq } from 'drizzle-orm'
import { isNil, noop } from 'lodash-es'
import config from '../config'
import { type RepositoryWatcherConsumeContent, repositoryWatcherRestartTask, repositoryWatcherStartTask, repositoryWatcherStopTask } from './task'

const db = useDrizzleClient(config.databaseUrl)

export async function startRepositoryWatcherWorker() {
	return await Promise.all([
		handleStartTask(),
		handleStopTask(),
		handleRestartTask(),
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
	}
}

async function handleStopTask() {
	for await (const message of repositoryWatcherStopTask.consume()) {
		noop(message)
	}
}

async function handleRestartTask() {
	for await (const message of repositoryWatcherRestartTask.consume()) {
		noop(message)
	}
}
