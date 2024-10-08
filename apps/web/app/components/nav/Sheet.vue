<script setup lang="ts">
import { Home, LineChart, PanelLeft } from 'lucide-vue-next'
</script>

<template>
	<Sheet>
		<SheetTrigger as-child>
			<Button size="icon" variant="outline" class="sm:hidden">
				<PanelLeft class="h-5 w-5" />
				<span class="sr-only">Toggle Menu</span>
			</Button>
		</SheetTrigger>
		<SheetContent side="left" class="sm:max-w-xs">
			<nav class="grid gap-6 text-lg font-medium">
				<a class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
					<Home class="h-5 w-5" />
					Home
				</a>
				<a class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
					<LineChart class="h-5 w-5" />
					Settings
				</a>
			</nav>
		</SheetContent>
	</Sheet>
</template>
