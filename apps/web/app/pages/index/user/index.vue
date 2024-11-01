<script setup lang="ts">
import { ListFilter, MoreHorizontal, PlusCircle } from 'lucide-vue-next'

const { $trpc, $text } = useNuxtApp()

const users_in_db = await $trpc.user.listUsers.query()
</script>

<template>
	<div class="flex min-h-screen w-full flex-col bg-muted/40">
		<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
			<main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
				<Tabs default-value="all">
					<div class="flex items-center">
						<!-- Top Filter And Add User -->
						<div class="ml-auto flex items-center gap-2">
							<!-- Filter -->
							<DropdownMenu>
								<DropdownMenuTrigger as-child>
									<Button variant="outline" size="sm" class="h-7 gap-1">
										<ListFilter class="h-3.5 w-3.5" />
										<span class="sr-only sm:not-sr-only sm:whitespace-nowrap">
											{{ $text.filter() }}
										</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>{{ $text.filterBy() }}</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem checked>
										{{ $text.manager() }}
									</DropdownMenuItem>
									<DropdownMenuItem>{{ $text.user() }}</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<!-- Add User -->
							<Button size="sm" class="h-7 gap-1">
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
									<TableBody>
										<TableRow v-for="user_member in users_in_db" :key="user_member.id">
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
											<TableCell>
												{{ user_member.username }}
											</TableCell>
											<TableCell>
												{{ user_member.isAdmin }}
											</TableCell>
											<TableCell>
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
									Showing <strong>1-10</strong> of <strong>32</strong>
									products
								</div>
							</CardFooter>
						</Card>
					</TabsContent>
				</Tabs>
			</main>
		</div>
	</div>
</template>
