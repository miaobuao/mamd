import chokidar from 'chokidar'
import consola from 'consola'
import { noop } from 'lodash-es'
import { usePrismaClient } from 'prisma-client-js'
import { type RepositoryWatcherConsumeContent, repositoryWatcherRestartTask, repositoryWatcherStartTask, repositoryWatcherStopTask } from './task'

const db = usePrismaClient()

Promise.all([
	handleStartTask(),
	handleStopTask(),
	handleRestartTask(),
])

async function handleStartTask() {
	for await (const message of repositoryWatcherStartTask.consume()) {
		handler(message)
			.catch(consola.error)
	}
	async function handler({ repositoryId }: RepositoryWatcherConsumeContent) {
		const repository = await db.repository.findUniqueOrThrow({
			where: {
				id: repositoryId,
			},
			select: {
				path: true,
			},
		})
		const watcher = chokidar.watch(repository.path, {
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

async function _repositoryExists(repositoryId: number) {
	const repository = await db.repository.findUnique({
		where: {
			id: repositoryId,
		},
		select: {
			path: true,
		},
	})
	return !!repository
}
