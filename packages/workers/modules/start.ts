import { startFileMetadataWorker } from './file-metadata/worker'
import { startRepositoryScannerWorker } from './repo-scanner/worker'
import { startRepositoryWatcherWorker } from './repository-watcher/worker'

Promise.all([
	startFileMetadataWorker(),
	startRepositoryScannerWorker(),
	startRepositoryWatcherWorker(),
])
