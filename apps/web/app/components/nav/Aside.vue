<script setup lang="ts">
import { CircleUser, Home, LogOut, Settings, Users2 } from 'lucide-vue-next'

const auth = useAuthStore()
const { $text } = useNuxtApp()
</script>

<template>
	<aside class="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
		<nav class="flex flex-col items-center gap-2 px-2 sm:py-5">
			<NavRouteButton path="/">
				<template #icon>
					<Home class="h-5 w-5" />
				</template>
				<template #label>
					Home
				</template>
			</NavRouteButton>
			<template v-if="auth.userInfo?.isAdmin">
				<NavRouteButton path="/admin/users">
					<template #icon>
						<Users2 class="h-5 w-5" />
					</template>
					<template #label>
						Users
					</template>
				</NavRouteButton>
			</template>
		</nav>
		<nav class="mt-auto flex flex-col items-center gap-2 px-2 sm:py-5">
			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<Button variant="ghost" size="icon">
						<CircleUser class="h-5 w-5" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>{{ auth.userInfo?.username }}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<a class="w-full" @click="auth.logout">
						<DropdownMenuItem>
							<LogOut class="mr-2 h-4 w-4" />
							{{ $text.logout() }}
						</DropdownMenuItem>
					</a>
				</DropdownMenuContent>
			</DropdownMenu>

			<NavRouteButton path="/settings">
				<template #icon>
					<Settings class="h-5 w-5" />
				</template>
				<template #label>
					Settings
				</template>
			</NavRouteButton>
		</nav>
	</aside>
</template>
