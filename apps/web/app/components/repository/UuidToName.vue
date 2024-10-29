<script setup lang="ts">
const props = defineProps<{
	repositoryUuid: string
	uuid: string
	type: 'file' | 'folder'
}>()

const uuidToNameStore = useUuidToNameStore()

const name = props.type === 'folder' ? uuidToNameStore.getFolder(props.repositoryUuid, props.uuid) : null
</script>

<template>
	{{ name?.name }}
</template>
