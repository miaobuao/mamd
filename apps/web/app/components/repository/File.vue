<script setup lang="ts">
import type { inferProcedureOutput } from '@trpc/server'
import type { AppRouter } from '~~/server/trpc/routers'
import { File } from 'lucide-vue-next'

export type FileOrFolder = inferProcedureOutput<AppRouter['fs']['listAll']>[number]

defineProps<{
	entry: FileOrFolder
}>()
</script>

<template>
	<RepositoryEntryOuterCard class="flex flex-col p-4">
		<File class="size-12 mx-auto" />
		<div class="w-full truncate text-center mt-auto">
			{{ entry.name }}
		</div>
	</RepositoryEntryOuterCard>
</template>
