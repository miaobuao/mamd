<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

const repositoryStore = useRepositoryStore()
const loading = ref(false)
const open = ref(false)

const { $text } = useNuxtApp()
const form = useForm({
	validationSchema: toTypedSchema(CreateRepositoryFormValidator),
})
const onSubmit = form.handleSubmit(async ({ name, path }) => {
	loading.value = true
	repositoryStore.createRepository({ name, path })
		.then(() => {
			toast.success($text.successfullyCreatedRepository())
			open.value = false
		}).finally(() => {
			loading.value = false
		})
})
</script>

<template>
	<Dialog v-model:open="open">
		<DialogTrigger as-child>
			<RepositoryOuterCard class="text-3xl hover:cursor-pointer" @click="open = true">
				+
			</RepositoryOuterCard>
		</DialogTrigger>
		<DialogContent class="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>
					{{ $text.createRepository() }}
				</DialogTitle>
				<DialogDescription>
					{{ $text.createRepositoryDescription() }}
				</DialogDescription>
			</DialogHeader>
			<form class="flex flex-col gap-y-2" @submit="onSubmit">
				<FormField v-slot="{ componentField }" name="name">
					<FormItem>
						<FormLabel>{{ $text.name() }}</FormLabel>
						<FormControl>
							<Input v-bind="componentField" />
						</FormControl>
						<FormMessage />
					</FormItem>
				</FormField>

				<FormField v-slot="{ componentField }" name="path">
					<FormItem>
						<FormLabel>{{ $text.path() }}</FormLabel>
						<FormControl>
							<Input v-bind="componentField" />
						</FormControl>
						<FormMessage />
					</FormItem>
				</FormField>

				<DialogFooter>
					<Button type="submit" :disabled="loading">
						<Loader2 v-show="loading" class="w-4 h-4 mr-2 animate-spin" />
						{{ $text.create() }}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
</template>
