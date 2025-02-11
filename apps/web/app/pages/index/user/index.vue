<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next'
import CreateUserDialog from './CreateUserDialog.vue'
import UpdateUserDialog from './UpdateUserDialog.vue'

const { $trpc, $text } = useNuxtApp()
// 查询模块 : 接收后端接口查询数据库结果
const { data: users, status, refresh } = $trpc.user.listUsers.useQuery()

const createUserDialog = ref()
const updateUserDialog = ref()

function openUpdateDialog(current_user_uuid: string) {
	// 或者通过逻辑判断
	const update_fit = updateUserDialog.value
	update_fit.updateVisible = true
	update_fit.uuid = current_user_uuid
}

async function deleteUser(uuid: string) {
	await $trpc.user.deleteUser.mutate({ uuid })
	users.value = users.value?.filter(user => user.uuid !== uuid) || []
	refresh()
}
</script>

<template>
	<section class="flex flex-col min-h-screen gap-y-2 p-4 bg-muted/40 ml-6">
		<section class="flex justify-end">
			<CreateUserDialog ref="createUserDialog" />
		</section>
		<section class="flex justify-end">
			<UpdateUserDialog ref="updateUserDialog" />
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
										<DropdownMenuItem @click="openUpdateDialog(user_member.uuid)">
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
