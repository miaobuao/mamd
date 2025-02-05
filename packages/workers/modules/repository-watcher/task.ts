import { NatsTask } from '../nats'

export interface RepositoryWatcherConsumeContent {
	repositoryId: string
}

export const repositoryWatcherStartTask = new NatsTask<RepositoryWatcherConsumeContent>('repository-watcher:start', 'repository-watcher:start')

export const repositoryWatcherStopTask = new NatsTask<RepositoryWatcherConsumeContent>('repository-watcher:stop')
