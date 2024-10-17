import type { FileMetadataConsumeContent } from './worker'
import { NatsTask } from '../nats'

export const FILE_METADATA_SUBJECT = 'file-metadata'
export const FILE_METADATA_QUEUE_NAME = 'file-metadata'

export const fileMetadataTask = new NatsTask<FileMetadataConsumeContent>(FILE_METADATA_SUBJECT, FILE_METADATA_QUEUE_NAME)
