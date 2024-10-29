import type { inferProcedureOutput } from '@trpc/server'
import type { AppRouter } from '~~/server/trpc/routers'
import { isClient } from '@vueuse/core'
import Dexie, { type EntityTable } from 'dexie'

type UuidMap<T> = Map<string, T>
type Folder = inferProcedureOutput<AppRouter['fs']['getFolder']>

export const useUuidToNameStore = defineStore('uuid-map', () => {
	const { $trpc } = useNuxtApp()

	const cacheDatabase = getCacheDatabase()
	const pendingFolderQueries: Record<string, boolean> = {}
	// TODO: maybe memory leak
	const foldersMap = reactive<UuidMap<Folder>>(new Map())

	function getFolder(repositoryUuid: string, uuid: string) {
		if (pendingFolderQueries[uuid] || foldersMap.has(uuid)) {
			return computed(() => foldersMap.get(uuid))
		}
		cacheDatabase?.folders.get([ repositoryUuid, uuid ])
			.then(async (cachedFolder) => {
				if (cachedFolder) {
					foldersMap.set(uuid, cachedFolder.data)
				}
			})
		pendingFolderQueries[uuid] = true
		$trpc.fs.getFolder
			.useQuery({ folderUuid: uuid, repositoryUuid })
			.then(({ data }) => {
				if (!data.value) {
					return
				}
				foldersMap.set(uuid, data.value)
				cacheDatabase?.folders.put({
					repositoryUuid,
					uuid,
					data: data.value,
				})
			})
			.finally(() => {
				delete pendingFolderQueries[uuid]
			})
		return computed(() => foldersMap.get(uuid))
	}

	return {
		getFolder,
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
