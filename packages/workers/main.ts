import { startFileMetadataWorker } from './modules/file-metadata/worker'
import { startRepositoryScannerWorker } from './modules/repo-scanner/worker'
import { startRepositoryWatcherWorker } from './modules/repository-watcher/worker'

Promise.all([
	startFileMetadataWorker(),
	startRepositoryScannerWorker(),
	startRepositoryWatcherWorker(),
])
