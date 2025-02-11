<script setup lang="ts">
import type { ClassValue } from 'clsx'
import { Home } from 'lucide-vue-next'
import { makeRepoUrl } from './utils'

defineProps<{
	repository: Repository
	path: string[]
	class?: ClassValue
}>()
</script>

<template>
	<Breadcrumb :class="$props.class">
		<BreadcrumbList>
			<BreadcrumbItem>
				<BreadcrumbLink as-child>
					<NuxtLink :to="makeRepoUrl(repository.uuid)" class="flex items-center gap-x-2">
						<Home class="size-4" />
						<span>
							{{ repository.name }}
						</span>
					</NuxtLink>
				</BreadcrumbLink>
			</BreadcrumbItem>
			<BreadcrumbSeparator v-if="path.length > 0" />
			<BreadcrumbItem v-for="name, i in path" :key="i">
				<BreadcrumbLink as-child>
					<NuxtLink :to="makeRepoUrl(repository.uuid, ...path.slice(0, i + 1))">
						{{ name }}
					</NuxtLink>
				</BreadcrumbLink>
				<BreadcrumbSeparator v-if="i < path.length - 1" />
			</BreadcrumbItem>
		</BreadcrumbList>
	</Breadcrumb>
</template>
