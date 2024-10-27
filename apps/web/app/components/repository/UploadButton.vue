<script setup lang="ts">
import { fileOpen } from 'browser-fs-access'
import { FileUp, FolderPlus, Plus } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

const props = defineProps<{
	repositoryUuid: string
	folderUuid: string
}>()

const { $trpc } = useNuxtApp()

const expanded = ref(false)

async function handleSelectFile() {
	const file = await fileOpen({
		mimeTypes: [ '*/*' ],
		description: 'Select a file',
	})

	const uuid = globalThis.crypto.randomUUID()
	const uploader = new SingleFileUploader(
		file,
		10,
		idx => $trpc.oss.assignUploadUrl.mutate({
			uuid,
			chunkIdx: idx,
		}),
	)
	uploader.start().then(() =>
		$trpc.oss.uploadEnded.mutate({
			uuid,
			fileName: file.name,
			folderUuid: props.folderUuid,
			repositoryUuid: props.repositoryUuid,
		}),
	)
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
			<div class="floating-button" @click="handleSelectFile">
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
