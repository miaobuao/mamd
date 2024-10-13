<script setup lang="ts">
import type { ClassValue } from 'clsx'
import { Breadcrumb } from '~/components/ui/breadcrumb'

const props = defineProps<{
	path: string[] | string | undefined
	class?: ClassValue
}>()

const currentFolderName = computed(() => {
	if (typeof props.path === 'string') {
		return props.path
	}
	return props.path?.at(-1)
})
const beforeFolderNames = computed(() => {
	if (typeof props.path === 'string') {
		return []
	}
	return props.path?.slice(0, -1)
})
</script>

<template>
	<Breadcrumb :class="$props.class">
		<BreadcrumbList>
			<BreadcrumbItem v-for="folderName, i in beforeFolderNames" :key="i">
				<BreadcrumbLink as-child>
					<a href="#">{{ folderName }}</a>
				</BreadcrumbLink>
				<BreadcrumbSeparator />
			</BreadcrumbItem>
			<BreadcrumbItem>
				<BreadcrumbPage>{{ currentFolderName }}</BreadcrumbPage>
			</BreadcrumbItem>
		</BreadcrumbList>
	</Breadcrumb>
</template>
