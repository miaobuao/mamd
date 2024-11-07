<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

const { $trpc, $text, $router } = useNuxtApp()
const route = useRoute()
const loading = ref(false)
const auth = useAuthStore()
const loginFormSchema = toTypedSchema(UserLoginSubmitFormValidator)
const form = useForm({
	validationSchema: loginFormSchema,
})

const onSubmit = form.handleSubmit(async (values) => {
	loading.value = true
	try {
		const userInfo = await $trpc.user.login.mutate(values)
		auth.updateUserInfo(userInfo)
		$router.replace(typeof route.query.from === 'string' ? route.query.from : '/')
		nextTick(() => {
			toast($text.successfullyLoggedIn())
		})
	}
	catch {
		toast($text.error.loginFailed())
	}
	finally {
		loading.value = false
	}
})
</script>

<template>
	<NuxtLayout name="login">
		<Card>
			<CardHeader>
				<CardTitle>{{ $text.login() }}</CardTitle>
			</CardHeader>
			<form @submit="onSubmit">
				<CardContent class="space-y-2">
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
								<Input type="password" v-bind="componentField" />
							</FormControl>
							<FormMessage />
						</FormItem>
					</FormField>
					<FormField v-slot="{ value, handleChange }" name="remember">
						<div class="flex items-center gap-x-2 pt-2">
							<FormLabel>{{ $text.rememberMe() }}</FormLabel>
							<FormControl>
								<Switch :checked="value" @update:checked="handleChange" />
							</FormControl>
							<FormMessage />
						</div>
					</FormField>
				</CardContent>
				<CardFooter>
					<Button type="submit" :disabled="loading">
						<Loader2 v-show="loading" class="w-4 h-4 mr-2 animate-spin" />
						{{ $text.login() }}
					</Button>
				</CardFooter>
			</form>
		</Card>
	</NuxtLayout>
</template>
