<script setup lang="ts">
const repositoryStore = useRepositoryStore()
</script>

<template>
	<div class="w-full p-4 gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
		<template
			v-for=" repository in repositoryStore.repositories"
			:key="repository.id"
		>
			<NuxtLink :to="`/repo/${repository.uuid}`">
				<RepositoryInfoCard
					:repository="repository"
				/>
			</NuxtLink>
		</template>
		<RepositoryCreatorCard />
	</div>
</template>
