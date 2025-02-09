<script setup lang="ts">
import type { FolderModel } from '~~/shared/models/v1/folder'
import type { RepositoryModel } from '~~/shared/models/v1/repository'
import path from 'node:path'
import { fileOpen } from 'browser-fs-access'
import { FileUp, FolderPlus, Plus } from 'lucide-vue-next'

const props = defineProps<{
	folder: FolderModel
	repository: RepositoryModel
}>()

const { $api } = useNuxtApp()
const expanded = ref(false)

async function uploadFile() {
	const file = await fileOpen({
		mimeTypes: [ '*/*' ],
		description: 'Select a file',
	})
	const targetFullPath = path.join(props.folder.fullPath, file.name)
	const targetRelativePath = path.relative(props.repository.linkedFolder.fullPath, targetFullPath)
	await $api(`/api/v1/repositories/${props.repository.id}/files/${targetRelativePath}`)
}
</script>

<template>
	<div class="relative select-none">
		<div
			class="text-6xl text-primary-foreground bg-primary hover:bg-primary/80 rounded-full p-4 hover:cursor-pointer"
			@click="expanded = !expanded"
		>
			<Plus class="size-6" />
		</div>
		<div
			:class="cn('absolute transition-all w-full top-0 flex flex-col items-center justify-center p-4 gap-y-4', {
				'opacity-100 translate-y-[-100%]': expanded,
				'opacity-0 pointer-events-none': !expanded,
			})"
		>
			<div class="floating-button">
				<FolderPlus class="size-6" />
			</div>
			<div class="floating-button" @click="uploadFile">
				<FileUp class="size-6" />
			</div>
		</div>
	</div>
</template>

<style scoped>
.floating-button {
  @apply bg-secondary rounded-full p-3 border border-border shadow-md hover:cursor-pointer;
}
</style>
