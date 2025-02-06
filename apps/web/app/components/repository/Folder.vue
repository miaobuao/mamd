<script setup lang="ts">
import type { FileOrFolder } from './File.vue'
import { Icon } from '@iconify/vue'

defineProps<{
	entry: FileOrFolder
}>()
</script>

<template>
	<RepositoryEntryOuterCard class="flex flex-col p-4 gap-1">
		<Icon icon="vscode-icons:default-folder" class="size-12 mx-auto" />
		<div class="w-full truncate text-center mt-auto">
			{{ entry.name }}
		</div>
	</RepositoryEntryOuterCard>
</template>
