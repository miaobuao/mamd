<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

const { $text } = useNuxtApp()
const route = useRoute()
const loading = ref(false)

const registerFormSchema = toTypedSchema(UserRegisterInputFormValidator)
const form = useForm({
	validationSchema: registerFormSchema,
})

const onSubmit = form.handleSubmit(async ({ confirmPassword, password, username }) => {
	if (confirmPassword !== password) {
		form.setFieldError('confirmPassword', $text.passwordNotMatch())
		return
	}
	loading.value = true
	useApi('/api/v1/admin/init', {
		method: 'post',
		body: {
			username,
			password,
		},
	}).then(() => {
		toast($text.successfullyRegistered(), {
			description: $text.pleaseLogInWithYourUsernameAndPassword(),
		})
		navigateTo({ path: '/login', query: route.query })
	}).finally(() => {
		loading.value = false
	})
})
</script>

<template>
	<NuxtLayout name="login">
		<Card>
			<CardHeader>
				<CardTitle>{{ $text.signUp() }}</CardTitle>
			</CardHeader>
			<form @submit="onSubmit">
				<CardContent class="space-y-2">
					<FormField v-slot="{ componentField }" name="username">
						<FormItem v-auto-animate>
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
								<Input type="password" v-bind="componentField" />
							</FormControl>
							<FormMessage />
						</FormItem>
					</FormField>
					<FormField v-slot="{ componentField }" name="confirmPassword">
						<FormItem>
							<FormLabel>{{ $text.confirmPassword() }}</FormLabel>
							<FormControl>
								<Input type="password" v-bind="componentField" />
							</FormControl>
							<FormMessage />
						</FormItem>
					</FormField>
				</CardContent>
				<CardFooter>
					<Button type="submit" :disabled="loading">
						<Loader2 v-show="loading" class="w-4 h-4 mr-2 animate-spin" />
						{{ $text.signUp() }}
					</Button>
				</CardFooter>
			</form>
		</Card>
	</NuxtLayout>
</template>
