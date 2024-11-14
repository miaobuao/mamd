<script setup lang="ts">
defineProps<{
	path: string
}>()

const route = useRoute()

function isActive(currentPath: string, targetPath: string) {
	if (targetPath === '/') {
		return currentPath === '/'
	}
	return currentPath.startsWith(targetPath)
}
</script>

<template>
	<TooltipProvider>
		<Tooltip>
			<TooltipTrigger as-child>
				<NuxtLink :to="path">
					<Button variant="ghost" size="icon" :class="cn('rounded-lg', isActive(path, route.path) && 'bg-muted')">
						<slot name="icon" />
					</Button>
				</NuxtLink>
			</TooltipTrigger>
			<TooltipContent side="right">
				<slot name="label" />
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
</template>
