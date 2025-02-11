<script setup lang="ts">
import type { FileOrFolder } from './File.vue'

defineProps<{
	entry: FileOrFolder
}>()
</script>

<template>
	<RepositoryEntryOuterCard class="flex flex-col p-4 gap-1">
		<span class="icon-[vscode-icons--default-folder] size-12 mx-auto" />
		<div class="w-full truncate text-center mt-auto">
			{{ entry.name }}
		</div>
	</RepositoryEntryOuterCard>
</template>
