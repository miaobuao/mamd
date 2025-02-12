<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next'

const { $trpc, $text } = useNuxtApp()
// 查询模块 : 接收后端接口查询数据库结果
const { data: users, status, refresh } = $trpc.user.listUsers.useQuery()

interface UserModel {
	id: string
	username: string
	isAdmin: boolean
	ctime: string
	mtime: string
}

const selectedUser = ref<UserModel>()

const createUserDialogOpen = ref(false)
const updateUserDialogOpen = ref(false)

function openUpdateDialog(user: UserModel) {
	updateUserDialogOpen.value = true
	selectedUser.value = user
}

async function deleteUser(id: string) {
	await $trpc.user.deleteUser.mutate({ id })
	users.value = users.value?.filter((user) => user.id !== id) || []
	refresh()
}
</script>

<template>
	<AdminCreateUserDialog v-model:open="createUserDialogOpen" @after-created="refresh" />
	<AdminUpdateUserDialog v-if="selectedUser" v-model:open="updateUserDialogOpen" :user="selectedUser" @after-updated="refresh" />
	<section class="flex flex-col min-h-screen gap-y-2 p-4 bg-muted/40">
		<section class="flex justify-end">
			<Button variant="outline" @click="createUserDialogOpen = true">
				{{ $text.createUser() }}
			</Button>
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
							<TableHead>
								<span class="sr-only">{{ $text.avatar() }}</span>
							</TableHead>
							<!-- <TableHead>{{ $text.id() }}</TableHead> -->
							<TableHead>{{ $text.username() }}</TableHead>
							<TableHead class="hidden md:table-cell">
								{{ $text.isManager() }}
							</TableHead>
							<TableHead class="hidden md:table-cell">
								{{ $text.createTime() }}
							</TableHead>
							<TableHead>
								<span>{{ $text.action() }}</span>
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
							<TableCell>
								<UserAvatar
									:id="user_member.id"
									:alt="user_member.username[0]?.toUpperCase()"
									class="aspect-square rounded-md object-cover size-12 text-2xl"
								/>
							</TableCell>

							<TableCell>
								{{ user_member.username }}
							</TableCell>
							<TableCell>
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
										<DropdownMenuItem @click="openUpdateDialog(user_member)">
											{{ $text.edit() }}
										</DropdownMenuItem>
										<DropdownMenuItem @click="deleteUser(user_member.id)">
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
