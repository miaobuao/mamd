<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useVModel } from '@vueuse/core'
import { Loader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

const props = defineProps<{
	open: boolean
	user: {
		id: string
		username: string
		isAdmin: boolean
		ctime: string
		mtime: string
	}
}>()

const emits = defineEmits<{
	(e: 'update:open'): void
}>()

const { $trpc, $text } = useNuxtApp()
const open = useVModel(props, 'open', emits)

const editUserFormSchema = toTypedSchema(EditUserInputValidator)
const formUpdateUser = useForm({ validationSchema: editUserFormSchema })
const passwordExist = ref('')
const loading = ref(false)

const onUpdate = formUpdateUser.handleSubmit(async (values) => { // 更新用户按钮逻辑
	loading.value = true
	try {
		await $trpc.user.editUser.mutate(values)
		nextTick(() => {
			toast($text.successfullyUpdatedUser())
		})
		open.value = false
	}
	catch {
		toast($text.error.updateUserFailed())
	}
	finally {
		loading.value = false
	}
})
</script>

<template>
	<Dialog v-model:open="open">
		<DialogContent class="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>{{ $text.updateUser() }}</DialogTitle>
				<DialogDescription>{{ $text.updateUserDescription() }}</DialogDescription>
			</DialogHeader>

			<form @submit.prevent="onUpdate">
				<FormField v-slot="{ componentField }" name="username">
					<FormItem>
						<FormLabel>{{ $text.username() }}</FormLabel>
						<FormControl>
							<Input v-bind="componentField" />
						</FormControl>
						<FormMessage />
					</FormItem>
				</FormField>
				<FormField v-slot="{ componentField }" name="password">
					<FormItem>
						<FormLabel>{{ $text.password() }}</FormLabel>
						<FormControl>
							<Input v-bind="componentField" v-model="passwordExist" type="password" />
						</FormControl>
						<FormMessage />
					</FormItem>
				</FormField>
				<FormField v-if="passwordExist" v-slot="{ componentField }" name="confirmPassword">
					<FormItem>
						<FormLabel>{{ $text.confirmPassword() }}</FormLabel>
						<FormControl>
							<Input v-bind="componentField" type="password" />
						</FormControl>
						<FormMessage />
					</FormItem>
				</FormField>
				<FormField v-slot="{ value, handleChange }" name="isAdmin">
					<FormItem class="mt-4">
						<div class="flex items-center space-x-2">
							<FormLabel>{{ $text.isManager() }}</FormLabel>
							<FormControl>
								<Switch :checked="value" @update:checked="handleChange" />
							</FormControl>
						</div>
						<FormMessage />
					</FormItem>
				</FormField>
				<DialogFooter>
					<Button type="submit" :disabled="loading">
						<Loader2 v-show="loading" class="w-4 h-4 mr-2 animate-spin" />
						{{ $text.updateUser() }}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
</template>
