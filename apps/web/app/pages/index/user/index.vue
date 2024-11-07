<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2, MoreHorizontal } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

const { $trpc, $text } = useNuxtApp()
// 查询模块 : 接收后端接口查询数据库结果
const { data: users, status, refresh } = $trpc.user.listUsers.useQuery()
// 添加模块 : web端添加用户并在user页面呈现
const createUserFormSchema = toTypedSchema(CreateUserInputValidator)
const form = useForm({
	validationSchema: createUserFormSchema,
})
const loading = ref(false) // 添加用户界面按钮加载状态开关
const visible = ref(false) // 添加用户界面开关
const visControl = function () {
	visible.value = true
}

const onSubmit = form.handleSubmit(async (values) => { // 添加用户按钮逻辑
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
		visible.value = false
		refresh()
	}
})
</script>

<template>
	<main class="flex flex-col min-h-screen gap-y-2 p-4 bg-muted/40">
		<section class="flex justify-end">
			<Dialog v-model:open="visible">
				<DialogTrigger as-child>
					<Button variant="outline" @click="visControl">
						{{ $text.createUser() }}
					</Button>
				</DialogTrigger>
				<DialogContent class="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{{ $text.createUser() }}</DialogTitle>
						<DialogDescription>{{ $text.createUserDescription() }}</DialogDescription>
					</DialogHeader>

					<form @submit="onSubmit">
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
						<FormField v-slot="{ value, handleChange }" name="isAdmin">
							<FormItem class="mt-4">
								<div class="flex items-center space-x-2">
									<FormLabel>{{ $text.isManager() }}</FormLabel>
									<FormControl>
										<Switch id="isAdmin" :checked="value" @update:checked="handleChange" />
									</FormControl>
								</div>
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
		</section>
		<Card>
			<!-- Title and SubTitle -->
			<CardHeader>
				<CardTitle>{{ $text.userManagement() }}</CardTitle>
				<CardDescription>
					{{ $text.manageUser() }}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<!-- table title and action -->
					<TableHeader>
						<TableRow>
							<TableHead class="hidden w-[100px] sm:table-cell">
								<span class="sr-only">{{ $text.avatar() }}</span>
							</TableHead>
							<TableHead>{{ $text.id() }}</TableHead>
							<TableHead>{{ $text.username() }}</TableHead>
							<TableHead>{{ $text.isManager() }}</TableHead>
							<TableHead>{{ $text.createTime() }}</TableHead>
							<TableHead>
								<span class="sr-only">{{ $text.action() }}</span>
							</TableHead>
						</TableRow>
					</TableHeader>
					<!-- content -->
					<TableBody v-if="status === 'pending'">
						<TableRow v-for="user_member in users" :key="user_member.id">
							<TableCell class="hidden sm:table-cell">
								<Skeleton class="h-[70px] w-full rounded-xl" />
							</TableCell>
							<TableCell class="hidden sm:table-cell">
								<Skeleton class="h-[70px] w-full rounded-xl" />
							</TableCell>
							<TableCell class="hidden sm:table-cell">
								<Skeleton class="h-[70px] w-full rounded-xl" />
							</TableCell>
							<TableCell class="hidden sm:table-cell">
								<Skeleton class="h-[70px] w-full rounded-xl" />
							</TableCell>
							<TableCell class="hidden sm:table-cell">
								<Skeleton class="h-[70px] w-full rounded-xl" />
							</TableCell>
						</TableRow>
					</TableBody>
					<TableBody v-if="status === 'success'">
						<TableRow v-for="user_member in users" :key="user_member.id">
							<TableCell class="hidden sm:table-cell">
								<img
									alt="{{$text.atavar()}}"
									class="aspect-square rounded-md object-cover"
									height="64"
									src="https://github.com/radix-vue.png"
									width="64"
								>
							</TableCell>
							<TableCell class="font-medium">
								{{ user_member.id }}
							</TableCell>
							<TableCell class="hidden md:table-cell">
								{{ user_member.username }}
							</TableCell>
							<TableCell class="hidden md:table-cell">
								{{ user_member.isAdmin }}
							</TableCell>
							<TableCell class="hidden md:table-cell">
								{{ user_member.ctime }}
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger as-child>
										<Button
											aria-haspopup="true"
											size="icon"
											variant="ghost"
										>
											<MoreHorizontal class="h-4 w-4" />
											<span class="sr-only">{{ $text.toggleMenu() }}</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>{{ $text.action() }}</DropdownMenuLabel>
										<DropdownMenuItem>{{ $text.edit() }}</DropdownMenuItem>
										<DropdownMenuItem>{{ $text.delete() }}</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</CardContent>
			<CardFooter>
				<div class="text-xs text-muted-foreground">
					{{ $text.userShowWords() }} <strong>{{ users ? users.length : 0 }}</strong> {{ $text.users() }}
				</div>
			</CardFooter>
		</Card>
	</main>
</template>
