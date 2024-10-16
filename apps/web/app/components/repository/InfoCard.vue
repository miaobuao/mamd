<script setup lang="ts">
defineProps<{
	repository: Repository
}>()

defineEmits<{
	(e: 'click', repository: Repository): void
}>()
</script>

<template>
	<RepositoryOuterCard @click="$emit('click', repository)">
		<div>{{ repository.name }}</div>
	</RepositoryOuterCard>
</template>
