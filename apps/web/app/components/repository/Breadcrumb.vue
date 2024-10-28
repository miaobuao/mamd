<script setup lang="ts">
import type { ClassValue } from 'clsx'
import { Home } from 'lucide-vue-next'
import { Breadcrumb } from '~/components/ui/breadcrumb'
import { makeRepoUrl } from './utils'

const props = defineProps<{
	repository: Repository
	path: string[] | string | undefined
	class?: ClassValue
}>()

const filteredPath = computed(() => {
	let paths: string[] = []
	if (typeof props.path === 'string') {
		paths = [ props.path ]
	}
	else if (Array.isArray(props.path)) {
		paths = props.path
	}
	return paths.filter(Boolean)
})

const currentFolderUuid = computed(() => {
	if (typeof filteredPath.value === 'string') {
		return filteredPath.value
	}
	return filteredPath.value?.at(-1)
})

const beforeFolderPaths = computed(() => {
	const fst = filteredPath.value[0]
	if (fst === props.repository.linkedFolder?.uuid) {
		return filteredPath.value.slice(1, -1)
	}
	return filteredPath.value?.slice(0, -1)
})
</script>

<template>
	<Breadcrumb :class="$props.class">
		<BreadcrumbList>
			<BreadcrumbItem>
				<BreadcrumbLink as-child>
					<NuxtLink :to="makeRepoUrl(repository.uuid, repository.linkedFolder?.uuid)" class="flex items-center gap-x-2">
						<Home class="size-4" />
						<span>
							{{ repository.name }}
						</span>
					</NuxtLink>
				</BreadcrumbLink>
			</BreadcrumbItem>
			<BreadcrumbSeparator v-if="beforeFolderPaths !== undefined" />
			<BreadcrumbItem v-for="folderUuid, i in beforeFolderPaths" :key="i">
				<BreadcrumbLink as-child>
					<NuxtLink :to="makeRepoUrl(repository.uuid, ...beforeFolderPaths?.slice(0, i + 1))">
						<RepositoryUuidToName :repository-uuid="repository.uuid" :uuid="folderUuid" type="folder" />
					</NuxtLink>
				</BreadcrumbLink>
				<BreadcrumbSeparator />
			</BreadcrumbItem>
			<BreadcrumbItem v-if="currentFolderUuid && currentFolderUuid !== repository.linkedFolder?.uuid">
				<BreadcrumbPage>
					<RepositoryUuidToName :repository-uuid="repository.uuid" :uuid="currentFolderUuid" type="folder" />
				</BreadcrumbPage>
			</BreadcrumbItem>
		</BreadcrumbList>
	</Breadcrumb>
</template>
