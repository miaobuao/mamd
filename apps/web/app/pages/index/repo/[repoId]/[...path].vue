<script setup lang="ts">
import type { FileOrFolder } from '~/components/repository/File.vue'
import { ChevronsRight, Home, ListTree, Redo2, Search } from 'lucide-vue-next'
import { makeRepoUrl } from '~/components/repository/utils'

const { $trpc } = useNuxtApp()
const route = useRoute()
const repositoryStore = useRepositoryStore()

const items = ref<FileOrFolder[]>()
const repositoryUuid = computed(() => route.params.repoId as string)
const repository = ref(
	await useAsyncData(() => repositoryStore.queryRepository(repositoryUuid.value))
		.then((d) => d.data.value),
)

watch(repositoryUuid, (uuid) => {
	useAsyncData(() => repositoryStore.queryRepository(uuid))
		.then((d) => {
			repository.value = d.data.value
		})
})

const currentPath = computed(() => {
	const path = Array.isArray(route.params.path)
		? route.params.path
		: [ route.params.path ]
	return path.filter(Boolean) as string[]
})

watch([ repository, currentPath ], async () => {
	if (!repository.value)
		return
	const currentPathStr = currentPath.value.join('/')
	items.value = await $trpc.fs.listAllFromPath.useQuery({
		repositoryId: repository.value.uuid,
		path: currentPathStr,
	}).then((entries) => entries.data.value ?? [])
}, {
	immediate: true,
})
</script>

<template>
	<div>
		<header class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-transparent backdrop-blur-sm px-4 sm:h-auto sm:border-0 sm:shadow-sm sm:px-6 sm:py-2">
			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<Button size="icon" variant="outline" class="sm:hidden">
						<ListTree class="size-5" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" class="mx-2 max-w-[calc(100vw-1rem)] max-h-[calc(100vh-60px)] overflow-auto">
					<template v-for="path, i in [ repository?.name, ...currentPath ]" :key="i">
						<DropdownMenuSeparator v-if="i > 0" />
						<NuxtLink :to="i === 0 ? makeRepoUrl(repository!.uuid) : makeRepoUrl(repository!.uuid, ...currentPath.slice(0, i))">
							<DropdownMenuLabel class="flex items-center gap-2">
								<Home v-if="i === 0" />
								<ChevronsRight v-else-if="i === currentPath.length" />
								<Redo2 v-else />
								<div class="flex-1 truncate">
									{{ path }}
								</div>
							</DropdownMenuLabel>
						</NuxtLink>
					</template>
				</DropdownMenuContent>
			</DropdownMenu>
			<RepositoryBreadcrumb
				v-if="repository"
				class="hidden sm:block"
				:repository="repository"
				:path="currentPath"
			/>
			<div class="relative ml-auto flex-1 md:grow-0">
				<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search..."
					class="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
				/>
			</div>
			<NavSheet side="right" class="sm:hidden" />
		</header>
		<main class="gap-2 sm:gap-4 grid">
			<template v-for="item in items" :key="item.id">
				<NuxtLink :to="`${route.fullPath}/${encodeURIComponent(item.name)}`">
					<RepositoryFolder v-if="item.isDir" :entry="item" />
					<RepositoryFile v-else :entry="item" class="text-sm" />
				</NuxtLink>
			</template>
		</main>
		<div class="fixed bottom-0 right-0 m-8">
			<RepositoryUploadButton :repository-uuid="repositoryUuid" :folder-uuid="currentPath.at(-1)!" />
		</div>
	</div>
</template>

<style scoped>
.grid {
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
}
</style>
