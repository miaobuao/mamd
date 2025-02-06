<script setup lang="ts">
import { Home, LineChart, PanelLeft } from 'lucide-vue-next'

defineProps<{
	side?: 'left' | 'right' | 'top' | 'bottom' | null
}>()
</script>

<template>
	<Sheet>
		<SheetTrigger as-child>
			<Button size="icon" variant="outline" v-bind="$attrs">
				<PanelLeft class="h-5 w-5" />
			</Button>
		</SheetTrigger>
		<SheetContent :side="side" class="sm:max-w-xs">
			<nav class="grid gap-6 text-lg font-medium">
				<NuxtLink to="/" class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
					<Home class="h-5 w-5" />
					Home
				</NuxtLink>
				<NuxtLink to="/settings" class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
					<LineChart class="h-5 w-5" />
					Settings
				</NuxtLink>
			</nav>
		</SheetContent>
	</Sheet>
</template>
