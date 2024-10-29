import type { inferProcedureOutput } from '@trpc/server'
import type { AppRouter } from '~~/server/trpc/routers'
import { isClient } from '@vueuse/core'
import { from, useObservable } from '@vueuse/rxjs'
import Dexie, { type EntityTable } from 'dexie'
import { liveQuery } from 'dexie'

export type Folder = inferProcedureOutput<AppRouter['fs']['getFolder']>

export const useUuidMapStore = defineStore('uuid-map', () => {
	const { $trpc } = useNuxtApp()

	const cacheDatabase = getCacheDatabase()
	const pendingQueries: Record<string, boolean> = {}

	function getFolder(repositoryUuid: string, uuid: string) {
		const res = useObservable(
			from(
				liveQuery(
					() => cacheDatabase?.folders.get([ repositoryUuid, uuid ]),
				),
			),
		)
		if (pendingQueries[uuid]) {
			return res
		}
		pendingQueries[uuid] = true
		$trpc.fs.getFolder
			.useQuery({ folderUuid: uuid, repositoryUuid })
			.then(({ data }) => {
				if (data.value) {
					upsertFolder(repositoryUuid, uuid, data.value)
				}
			})
			.finally(() => {
				delete pendingQueries[uuid]
			})
		return res
	}

	function upsertFolder(repositoryUuid: string, uuid: string, data: Folder) {
		return cacheDatabase?.folders.put({
			repositoryUuid,
			uuid,
			data,
		})
	}

	return {
		getFolder,
		upsertFolder,
	}
})

interface CacheCollection<T> {
	repositoryUuid: string
	uuid: string
	data: T
}

function getCacheDatabase() {
	if (!isClient)
		return
	const db = new Dexie('CacheDatabase') as Dexie & {
		folders: EntityTable< CacheCollection<Folder>, 'repositoryUuid' | 'uuid' >
	}
	db.version(1).stores({
		folders: '[repositoryUuid+uuid], data',
	})
	return db
}
