import { NatsTask } from '../nats'

export const FILE_METADATA_SUBJECT = 'file-metadata'
export const FILE_METADATA_QUEUE_NAME = 'file-metadata'

export interface FileTask {
	isFile: true
	id: number
	path: string
}

export interface FolderTask {
	isFile: false
	id: number
	path: string
}

export type FileMetadataConsumeContent = FileTask | FolderTask

export const fileMetadataTask = new NatsTask<FileMetadataConsumeContent>(FILE_METADATA_SUBJECT, FILE_METADATA_QUEUE_NAME)
