import type { inferProcedureOutput } from '@trpc/server'
import type { AppRouter } from '~~/server/trpc/routers'
import type { TypeOf } from 'zod'
import { debounce } from 'lodash-es'
import type { CreateRepositoryFormValidator } from '~/utils/validator'

type Repository = inferProcedureOutput<AppRouter['repository']['listVisible']>[number]

export const useRepositoryStore = defineStore('repository', () => {
	const { $trpc } = useNuxtApp()
	const repositories = reactive<Repository[]>([])

	function removeRepository(uuid: string) {
		const idx = repositories.findIndex(v => v.repository.uuid === uuid)
		if (idx === -1) {
			return
		}
		repositories.splice(idx, 1)
	}

	function appendRepository(repository: Repository) {
		repositories.push(repository)
	}

	async function createRepository(repo: TypeOf<typeof CreateRepositoryFormValidator>) {
		const { repository, linkedFolder } = await $trpc.repository.create.mutate(repo)
		const res = {
			repository: {
				uuid: repository.uuid,
				name: repository.name,
				linkedFolder,
			},
		}
		appendRepository(res)
		return res
	}

	const pullRepositories = debounce(() => {
		return $trpc.repository.listVisible.query().then((res) => {
			repositories.splice(0, repositories.length, ...res)
			return Array.from(repositories)
		})
	}, 500, { leading: true })

	return {
		repositories: computed(() => repositories.map(r => r.repository)),
		removeRepository,
		appendRepository,
		createRepository,
		pullRepositories,
	}
})
