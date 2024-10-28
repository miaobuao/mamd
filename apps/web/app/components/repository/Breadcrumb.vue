<script setup lang="ts">
import type { ClassValue } from 'clsx'
import { Home } from 'lucide-vue-next'
import { Breadcrumb } from '~/components/ui/breadcrumb'
import { makeRepoUrl } from './utils'

const props = defineProps<{
	repositoryUuid: string
	path: string[] | string | undefined
	class?: ClassValue
}>()

const filteredPath = computed(() => {
	if (typeof props.path === 'string') {
		return props.path
	}
	return props.path?.filter(Boolean)
})

const currentFolderName = computed(() => {
	if (typeof filteredPath.value === 'string') {
		return filteredPath.value
	}
	return filteredPath.value?.at(-1)
})
const beforeFolderNames = computed(() => {
	if (typeof filteredPath.value === 'string') {
		return []
	}
	return filteredPath.value?.slice(0, -1)
})
</script>

<template>
	<Breadcrumb :class="$props.class">
		<BreadcrumbList>
			<BreadcrumbItem>
				<BreadcrumbLink as-child>
					<NuxtLink :to="makeRepoUrl(repositoryUuid)">
						<Home class="size-4" />
					</NuxtLink>
				</BreadcrumbLink>
			</BreadcrumbItem>
			<BreadcrumbSeparator v-if="beforeFolderNames !== undefined" />
			<BreadcrumbItem v-for="folderName, i in beforeFolderNames" :key="i">
				<BreadcrumbLink as-child>
					<NuxtLink :to="makeRepoUrl(repositoryUuid, ...beforeFolderNames?.slice(0, i + 1))">
						{{ folderName }}
					</NuxtLink>
				</BreadcrumbLink>
				<BreadcrumbSeparator />
			</BreadcrumbItem>
			<BreadcrumbItem>
				<BreadcrumbPage>
					{{ currentFolderName }}
				</BreadcrumbPage>
			</BreadcrumbItem>
		</BreadcrumbList>
	</Breadcrumb>
</template>
