import consola from 'consola'
import { startFileMetadataWorker } from './file-metadata/worker'
import { startRepositoryScannerWorker } from './repo-scanner/worker'

consola.box(`Workers start at ${new Date()}`)

Promise.all([
	startFileMetadataWorker(),
	startRepositoryScannerWorker(),
])
