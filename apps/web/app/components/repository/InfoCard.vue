<script setup lang="ts">
const props = defineProps<{
	repository: Repository
}>()

defineEmits<{
	(e: 'click', repository: Repository): void
}>()
const { $trpc } = useNuxtApp()
async function startScan() {
	$trpc.repository.scan.mutate({
		repositoryUuid: props.repository.uuid,
	})
}
</script>

<template>
	<ContextMenu>
		<ContextMenuTrigger>
			<RepositoryOuterCard class="relative" @click="$emit('click', repository)">
				<UserAvatar
					:id="repository.creator.id"
					:alt="repository.creator.username"
					class="absolute top-4 right-4 size-10"
				/>
				<div>{{ repository.name }}</div>
			</RepositoryOuterCard>
		</ContextMenuTrigger>
		<ContextMenuContent class="w-64">
			<ContextMenuItem inset @click="startScan">
				Scan
			</ContextMenuItem>
			<ContextMenuItem inset>
				Edit
			</ContextMenuItem>
		</ContextMenuContent>
	</ContextMenu>
</template>
