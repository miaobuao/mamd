<script setup lang="ts">
import type { ClassValue } from 'clsx'
import { cn } from '~/lib/utils'

defineProps<{
	class?: ClassValue
}>()
</script>

<template>
	<Card :class="cn('flex justify-center items-center aspect-gallery transition-all hover:shadow-md', $props.class)">
		<slot />
	</Card>
</template>

<style lang="css" scoped>
.aspect-gallery {
  aspect-ratio: 3/4;
}
</style>
