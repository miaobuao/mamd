<script setup lang="ts">
import { Search } from 'lucide-vue-next'

const auth = useAuthStore()
const repositoryStore = useRepositoryStore()
const searchString = ref('')
const searchedRepositories = computed(() =>
	repositoryStore
		.repositories
		.filter((repo) => repo.name.toLowerCase().includes(searchString.value.toLowerCase())),
)
</script>

<template>
	<header class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-transparent backdrop-blur-sm px-4 sm:h-auto sm:border-0 sm:shadow-sm sm:px-6 sm:py-2">
		<UserAvatar :id="auth.userInfo!.uuid" :alt="auth.userInfo!.username" class="size-10 sm:hidden" />
		<div class="relative ml-auto flex-1 md:grow-0">
			<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
			<Input
				v-model="searchString"
				type="search"
				placeholder="Search..."
				class="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
			/>
		</div>
		<NavSheet side="right" class="sm:hidden" />
	</header>
	<div class="w-full p-4 gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
		<template
			v-for=" repository in searchedRepositories"
			:key="repository.id"
		>
			<NuxtLink :to="`/repo/${repository.uuid}/`">
				<RepositoryInfoCard
					:repository="repository"
				/>
			</NuxtLink>
		</template>
		<RepositoryCreatorCard />
	</div>
</template>
