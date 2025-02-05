import { startRepositoryWatcherWorker } from './repository-watcher/worker'

Promise.all([
	startRepositoryWatcherWorker(),
])
