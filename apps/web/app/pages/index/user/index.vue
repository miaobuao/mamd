<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2, MoreHorizontal } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

const { $trpc, $text } = useNuxtApp()
// 查询模块 : 接收后端接口查询数据库结果
const { data: users, status, refresh } = $trpc.user.listUsers.useQuery()

const createUserFormSchema = toTypedSchema(CreateUserInputValidator)
const formCreateUser = useForm({ validationSchema: createUserFormSchema })

// const editUserFormSchema = toTypedSchema(EditUserInputValidator)
// const formUpdateUser = useForm({ validationSchema: editUserFormSchema })

const loading = ref(false) // 添加用户界面按钮加载状态开关
const createVisible = ref(false) // 添加用户界面开关
const updateVisible = ref(false) // 更新用户界面开关
const passwordExist = ref('') // 更新用户界面密码输入框是否显示
const uuid = ref('') // 接受待更新用户的用户uuid

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

// const onUpdate = formUpdateUser.handleSubmit(async (values) => { // 更新用户按钮逻辑
// 	values.uuid = uuid.value
// 	loading.value = true
// 	try {
// 		await $trpc.user.editUser.mutate(values)
// 		nextTick(() => {
// 			toast($text.successfullyUpdatedUser())
// 		})
// 	}
// 	catch {
// 		toast($text.error.updateUserFailed())
// 	}
// 	finally {
// 		loading.value = false
// 		updateVisible.value = false
// 		refresh()
// 	}
// })

async function deleteUser(uuid: string) {
	await $trpc.user.deleteUser.mutate({ uuid })
	users.value = users.value?.filter(user => user.uuid !== uuid) || []
}
</script>

<template>
	<section class="flex flex-col min-h-screen gap-y-2 p-4 bg-muted/40 ml-6">
		<section class="flex justify-end">
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
		</section>
		<section class="flex justify-end">
			<Dialog v-model:open="updateVisible">
				<DialogContent class="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{{ $text.updateUser() }}</DialogTitle>
						<DialogDescription>{{ $text.updateUserDescription() }}</DialogDescription>
					</DialogHeader>

					<form>
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
										<Switch id="isAdmin" :checked="value" @update:checked="handleChange" />
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
						<TableRow v-for="user_member in users" :key="user_member.uuid">
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
						<TableRow v-for="user_member in users" :key="user_member.uuid">
							<TableCell class="hidden sm:table-cell">
								<img
									alt="{{$text.atavar()}}"
									class="aspect-square rounded-md object-cover"
									height="64"
									src="https://images.kimbleex.top/THEME/anzhiyu/MainWebPage/Avatar.avif"
									width="64"
								>
							</TableCell>
							<TableCell class="font-medium">
								{{ user_member.uuid }}
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
										<DropdownMenuItem @click="updateVisible = true, uuid = user_member.uuid">
											{{ $text.edit() }}
										</DropdownMenuItem>
										<DropdownMenuItem @click="deleteUser(user_member.uuid)">
											{{ $text.delete() }}
										</DropdownMenuItem>
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
	</section>
</template>
