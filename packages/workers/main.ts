import { startFileMetadataWorker } from './modules/file-metadata/worker'
import { startRepoScannerWorker } from './modules/repo-scanner/worker'

Promise.all([
	startFileMetadataWorker(),
	startRepoScannerWorker(),
])
