import { debounce } from 'lodash-es'
import type { TypeOf } from 'zod'
import type { CreateRepositoryFormValidator } from '~/utils/validator'

export interface Folder {
	id: string
	name: string
	ctime: string
	mtime: string
	repositoryId: string | null
	creatorId: string
	parentId: string | null
}

export interface Repository {
	id: string
	folder: Folder | null
}

export const useRepositoryStore = defineStore('repository', () => {
	const { $trpc } = useNuxtApp()
	const repositories = reactive<Repository[]>([])

	function removeRepository(id: string) {
		const idx = repositories.findIndex(v => v.id === id)
		if (idx === -1) {
			return
		}
		repositories.splice(idx, 1)
	}

	function appendRepository(repository: Repository) {
		repositories.push(repository)
	}

	async function createRepository(repo: TypeOf<typeof CreateRepositoryFormValidator>) {
		const res = await $trpc.repository.create.mutate(repo)
		appendRepository({
			id: res.repositoryId,
			folder: res.linkedFolder,
		})
		return res
	}

	const pullRepositories = debounce(() => {
		return $trpc.repository.listVisible.query().then((res) => {
			repositories.splice(0, repositories.length, ...res.map(v => ({
				id: v.repository.id,
				folder: v.repository.linkedFolder,
			})))
			return Array.from(repositories)
		})
	}, 500, { leading: true })

	return {
		repositories: computed(() => Array.from(repositories)),
		removeRepository,
		appendRepository,
		createRepository,
		pullRepositories,
	}
})
