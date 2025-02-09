import type { TypeOf } from 'zod'
import type { RepositoryModel } from '~~/shared/models/v1/repository'

export type Repository = RepositoryModel

export const useRepositoryStore = defineStore('repository', () => {
	const { $api } = useNuxtApp()
	const repositories = reactive<Repository[]>([])

	LogoutSubject.subscribe(() => {
		repositories.splice(0, repositories.length)
	})

	refreshRepositoriesList()

	async function queryRepository(id: string) {
		const found = repositories.find((v) => v.id === id)
		if (found) {
			return found
		}
		const repository = await $api(`/api/v1/repositories/${id}`)
		if (repository.data.value) {
			appendRepository(repository.data.value)
		}
		return repository.data.value
	}

	function removeRepository(id: string) {
		const idx = repositories.findIndex((v) => v.id === id)
		if (idx === -1) {
			return
		}
		repositories.splice(idx, 1)
	}

	function appendRepository(repository: Repository) {
		const idx = repositories.findIndex((v) => v.id === repository.id)
		if (idx === -1) {
			repositories.push(repository)
		}
		else {
			repositories[idx] = repository
		}
	}

	async function createRepository(repo: TypeOf<typeof CreateRepositoryFormValidator>) {
		const { data: { value } } = await $api(`/api/v1/repositories`, {
			method: 'POST',
			body: repo,
		})
		if (!value) {
			return
		}
		appendRepository(value)
		return value
	}

	async function refreshRepositoriesList() {
		const { data: { value } } = await $api('/api/v1/repositories')
		repositories.splice(0, repositories.length, ...(value ?? []))
		return Array.from(repositories)
	}

	return {
		repositories: computed(() => [ ...repositories ]),
		queryRepository,
		removeRepository,
		appendRepository,
		createRepository,
		refreshRepositoriesList,
	}
})
