<script setup lang="ts">
const props = defineProps<{
	repositoryUuid: string
	uuid: string
	type: 'file' | 'folder'
}>()

const { $trpc } = useNuxtApp()
const name = ref('')

if (props.type === 'folder') {
	// TODO: cache
	const folder = await $trpc.fs.getFolder.useQuery({
		folderUuid: props.uuid,
		repositoryUuid: props.repositoryUuid,
	})
	name.value = folder.data.value?.name ?? ''
}
</script>

<template>
	{{ name }}
</template>
