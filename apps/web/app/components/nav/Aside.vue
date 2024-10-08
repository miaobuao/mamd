<script setup lang="ts">
import { Home, Settings, Users2 } from 'lucide-vue-next'

const auth = useAuthStore()
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
				<NavRouteButton path="/user">
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
