<script setup lang="ts">
import { toast } from 'vue-sonner'

const repositoryStore = useRepositoryStore()
const open = ref(false)

const { $text } = useNuxtApp()
</script>

<template>
	<RepositoryOuterCard class="text-3xl hover:cursor-pointer" @click="open = true">
		+
	</RepositoryOuterCard>
	<RepositoryCreateDialog
		v-model:open="open"
		:title="$text.createRepository()"
		:description="$text.createRepositoryDescription()"
		@submit="(data, end) => {
			repositoryStore.createRepository(data)
				.then(() => {
					toast.success($text.successfullyCreatedRepository())
					open = false
				})
				.finally(end)
		}"
	/>
</template>
