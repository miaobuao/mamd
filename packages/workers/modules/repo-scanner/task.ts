import { NatsTask } from '../nats'

export const SCANNER_SUBJECT = 'folder-scanner'
export const SCANNER_QUEUE_NAME = 'folder-scanner:scanner'

export interface ScannerConsumeContent {
	repositoryId: string
	repositoryPath: string
}

export const scannerTask = new NatsTask<ScannerConsumeContent>(SCANNER_SUBJECT, SCANNER_QUEUE_NAME)
