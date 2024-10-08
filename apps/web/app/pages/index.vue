<script setup lang="ts">
import { CircleUser, LogOut, Search } from 'lucide-vue-next'

const auth = useAuthStore()
</script>

<template>
	<NuxtLayout name="app">
		<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
			<header class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
				<NavSheet />
				<Breadcrumb class="hidden md:flex">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink as-child>
								<a href="#">AAA</a>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>BBB</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
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
						<Button variant="secondary" size="icon" class="rounded-full">
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
			<main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
				<NuxtPage />
			</main>
		</div>
	</NuxtLayout>
</template>
