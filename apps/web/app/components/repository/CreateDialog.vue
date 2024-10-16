<script setup lang="ts">
import type { TypeOf } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useVModel } from '@vueuse/core'
import { Loader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'

const props = defineProps<{
	open: boolean
	title?: string
	description?: string
}>()

const emits = defineEmits<{
	(e: 'submit', form: TypeOf<typeof CreateRepositoryFormValidator>, end: () => void): void
	(e: 'update-open', open: boolean): void
}>()

const open = useVModel(props, 'open', emits)
const loading = ref(false)
const { $text } = useNuxtApp()

const form = useForm({
	validationSchema: toTypedSchema(CreateRepositoryFormValidator),
})

const onSubmit = form.handleSubmit(async (form) => {
	loading.value = true
	emits('submit', form, () => loading.value = false)
})
</script>

<template>
	<Dialog v-model:open="open">
		<DialogContent class="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>
					{{ title }}
				</DialogTitle>
				<DialogDescription>
					{{ description }}
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
