import { startFileMetadataWorker } from './file-metadata/worker'
import { startRepositoryScannerWorker } from './repo-scanner/worker'

Promise.all([
	startFileMetadataWorker(),
	startRepositoryScannerWorker(),
])
