<script setup lang="ts">
const props = defineProps<{
	alt?: string
	id: string
}>()

// TODO: username or props.alt
const altText = computed(() => props.alt)
</script>

<template>
	<Avatar v-bind="$attrs">
		<!-- TODO: user avatar -->
		<AvatarFallback>
			{{ altText }}
		</AvatarFallback>
	</Avatar>
</template>
