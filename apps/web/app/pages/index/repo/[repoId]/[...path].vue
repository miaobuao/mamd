<script setup lang="ts">
import { CircleUser, LogOut, Search } from 'lucide-vue-next'

const auth = useAuthStore()
const route = useRoute()
</script>

<template>
	<div class="sm:py-4">
		<header class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-transparent backdrop-blur-sm px-4 sm:h-auto sm:border-0 sm:shadow-sm sm:px-6">
			<NavSheet />
			<RepositoryBreadcrumb :path="route.params.path" />
			<div class="relative ml-auto flex-1 md:grow-0">
				<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search..."
					class="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
				/>
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<Button variant="secondary" size="icon" class="rounded-full flex sm:hidden">
						<CircleUser class="h-5 w-5" />
						<span class="sr-only">Toggle user menu</span>
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
		</header>
		view
	</div>
</template>
