<script setup lang="ts">
const props = defineProps<{
	repositoryUuid: string
	uuid: string
	type: 'file' | 'folder'
}>()

const uuidMapStore = useUuidMapStore()

const name = props.type === 'folder' ? uuidMapStore.getFolder(props.repositoryUuid, props.uuid) : null
</script>

<template>
	{{ name?.data.name }}
</template>
