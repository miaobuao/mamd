<script setup lang="ts">
import type { FileOrFolder } from './File.vue'
import { Folder } from 'lucide-vue-next'

defineProps<{
	entry: FileOrFolder
}>()
</script>

<template>
	<RepositoryEntryOuterCard class="flex flex-col p-4">
		<Folder class="size-12 mx-auto" />
		<div class="w-full truncate text-center mt-auto">
			{{ entry.name }}
		</div>
	</RepositoryEntryOuterCard>
</template>
