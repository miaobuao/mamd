export const MASTER_QUEUE = 'file-scanner:master'
export const HASH_WORKER_QUEUE = 'file-scanner:hash-worker'

export interface MasterConsumeContent {
	repositoryId: string
	repositoryPath: string
}
