<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

const createUserFormSchema = toTypedSchema(CreateUserInputValidator)
const formCreateUser = useForm({ validationSchema: createUserFormSchema })

const loading = ref(false) // 添加用户界面按钮加载状态开关
const createVisible = ref(false) // 添加用户界面开关

const onSubmit = formCreateUser.handleSubmit(async (values) => { // 添加用户按钮逻辑
	loading.value = true
	try {
		await $trpc.user.createUser.mutate(values)
		nextTick(() => {
			toast($text.successfullyCreatedUser())
		})
	}
	catch {
		toast($text.error.createUserFailed())
	}
	finally {
		loading.value = false
		createVisible.value = false
		refresh()
	}
})
defineExpose({
	onSubmit,
})
</script>

<template>
	<Dialog v-model:open="createVisible">
		<DialogTrigger as-child>
			<Button variant="outline">
				{{ $text.createUser() }}
			</Button>
		</DialogTrigger>
		<DialogContent class="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>{{ $text.createUser() }}</DialogTitle>
				<DialogDescription>{{ $text.createUserDescription() }}</DialogDescription>
			</DialogHeader>
			<form @submit.prevent="onSubmit">
				<FormField v-slot="{ componentField }" name="username" :control="formCreateUser">
					<FormItem>
						<FormLabel>{{ $text.username() }}</FormLabel>
						<FormControl>
							<Input v-bind="componentField" />
						</FormControl>
						<FormMessage />
					</FormItem>
				</FormField>
				<FormField v-slot="{ componentField }" name="password" :control="formCreateUser">
					<FormItem>
						<FormLabel>{{ $text.password() }}</FormLabel>
						<FormControl>
							<Input type="password" v-bind="componentField" />
						</FormControl>
						<FormMessage />
					</FormItem>
				</FormField>
				<FormField v-slot="{ value, handleChange }" name="isAdmin" :control="formCreateUser">
					<FormItem class="mt-4">
						<div class="flex items-center space-x-2">
							<FormLabel>{{ $text.isManager() }}</FormLabel>
							<FormControl>
								<Switch :checked="value" @update:checked="handleChange" />
							</FormControl>
						</div>
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
