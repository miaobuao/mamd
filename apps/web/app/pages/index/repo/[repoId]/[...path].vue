<script setup lang="ts">
import { last } from 'lodash-es'
import { CircleUser, LogOut, Search } from 'lucide-vue-next'
import type { FileOrFolder } from '~/components/repository/File.vue'

const { $trpc, $text } = useNuxtApp()

const auth = useAuthStore()
const uuidMapStore = useUuidMapStore()
const route = useRoute()
const router = useRouter()
const repositoryStore = useRepositoryStore()

const items = ref<FileOrFolder[]>([])
const repositoryUuid = computed(() => route.params.repoId as string)
const repository = ref<Repository>()

watch(repositoryUuid, (uuid) => {
	useAsyncData(() => repositoryStore.queryRepository(uuid))
		.then((d) => {
			repository.value = d.data.value
		})
}, {
	immediate: true,
})

const currentPath = computed(() => {
	let path
	if (Array.isArray(route.params.path)) {
		path = route.params.path
	}
	else {
		path = [ route.params.path ]
	}
	return path.filter(Boolean) as string[]
})

watch([ repository, currentPath ], ([ repository, currentPath ]) => {
	if (!repository)
		return
	if (currentPath.length === 0) {
		const linkedFolder = repository.linkedFolder?.uuid
		if (linkedFolder) {
			router.replace(`${route.fullPath}/${linkedFolder}`)
			return
		}
	}
	$trpc.fs.listAll.useQuery({
		repositoryUuid: repository.uuid,
		folderUuid: last(currentPath),
	}).then((entries) => {
		if (!entries.data.value) {
			return
		}
		items.value = entries.data.value
		items.value.forEach((item) => {
			if (!item.isFile) {
				uuidMapStore.upsertFolder(repositoryUuid.value, item.uuid, {
					name: item.name,
				})
			}
		})
	})
}, {
	immediate: true,
})
</script>

<template>
	<div>
		<header class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-transparent backdrop-blur-sm px-4 sm:h-auto sm:border-0 sm:shadow-sm sm:px-6 sm:py-2">
			<NavSheet />
			<RepositoryBreadcrumb
				v-if="repository"
				class="hidden sm:block"
				:repository="repository"
				:path="route.params.path"
			/>
			<div class="relative ml-auto flex-1 md:grow-0">
				<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search..."
					class="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
				/>
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<Button variant="secondary" size="icon" class="rounded-full flex sm:hidden">
						<CircleUser class="h-5 w-5" />
						<span class="sr-only">Toggle user menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>{{ auth.userInfo?.username }}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<a class="w-full" @click="auth.logout">
						<DropdownMenuItem>
							<LogOut class="mr-2 h-4 w-4" />
							{{ $text.logout() }}
						</DropdownMenuItem>
					</a>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
		<main class="gap-2 sm:gap-4 grid">
			<template v-for="item, i in items" :key="i">
				<NuxtLink :to="`${route.fullPath}/${item.uuid}`">
					<RepositoryFile v-if="item.isFile" :entry="item" class="text-sm" />
					<RepositoryFolder v-else :entry="item" />
				</NuxtLink>
			</template>
		</main>
		<div class="fixed bottom-0 right-0 m-8">
			<RepositoryUploadButton :repository-uuid="repositoryUuid" :folder-uuid="last(currentPath)!" />
		</div>
	</div>
</template>

<style scoped>
.grid {
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
}
</style>
