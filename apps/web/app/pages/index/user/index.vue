<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2, MoreHorizontal, PlusCircle } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

const { $trpc, $text } = useNuxtApp()
// 查询模块 : 接收后端接口查询数据库结果
let { data: users, status } = $trpc.user.listUsers.useQuery()
// 添加模块 : web端添加用户并在user页面呈现
const createUserFormSchema = toTypedSchema(CreateUserInputValidator)
const form = useForm({
	validationSchema: createUserFormSchema,
})
const loading = ref(false) // 添加用户界面按钮加载状态开关
const visable = ref(false) // 添加用户界面开关
const visControl = function () {
	visable.value = !visable.value
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
		visable.value = !visable.value
		const { data: users_new, status: status_new } = $trpc.user.listUsers.useQuery()
		users = users_new
		status = status_new
	}
})
</script>

<template>
	<div class="flex min-h-screen w-full flex-col bg-muted/40">
		<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
			<main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
				<Tabs default-value="all">
					<div class="flex items-center">
						<!-- Add User -->
						<div class="ml-auto flex items-center gap-2">
							<!-- Add User -->
							<Button size="sm" class="h-7 gap-1" @click="visControl">
								<PlusCircle class="h-3.5 w-3.5" />
								<span class="sr-only sm:not-sr-only sm:whitespace-nowrap">{{ $text.addUser() }}</span>
							</Button>
						</div>
					</div>
					<TabsContent value="all">
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
					</TabsContent>
				</Tabs>
			</main>
		</div>
	</div>

	<div v-if="visable" class="fixed inset-0 flex items-center justify-center bg-black/50">
		<Card v-if="visable" class="w-[350px]">
			<CardHeader>
				<CardTitle>{{ $text.createUser() }}</CardTitle>
				<CardDescription>{{ $text.createUserDescription() }}</CardDescription>
			</CardHeader>
			<form @submit="onSubmit">
				<CardContent>
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
					<CardFooter class="flex justify-between w-full mt-6">
						<!-- 用户界面取消按钮 -->
						<Button variant="outline" @click="visControl">
							{{ $text.cancel() }}
						</Button>
						<!-- 用户界面数据提交 -->
						<Button type="submit" :disabled="loading">
							<Loader2 v-show="loading" class="w-4 h-4 mr-2 animate-spin" />
							{{ $text.create() }}
						</Button>
					</CardFooter>
				</CardContent>
			</form>
		</Card>
	</div>
</template>
