<script setup lang="ts">
import { Badge } from '@/components/ui/badge'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Tabs,
	TabsContent,
} from '@/components/ui/tabs'

import {
	Home,
	LineChart,
	ListFilter,
	MoreHorizontal,
	Package,
	Package2,
	PanelLeft,
	PlusCircle,
	ShoppingCart,
	Users2,
} from 'lucide-vue-next'
</script>

<template>
	<div class="flex min-h-screen w-full flex-col bg-muted/40">
		<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
			<header class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
				<Sheet>
					<SheetTrigger as-child>
						<Button size="icon" variant="outline" class="sm:hidden">
							<PanelLeft class="h-5 w-5" />
							<span class="sr-only">Toggle Menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="left" class="sm:max-w-xs">
						<a
							href="#"
							class="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
						>
							<Package2 class="h-5 w-5 transition-all group-hover:scale-110" />
							<span class="sr-only">Acme Inc</span>
						</a>
						<a
							href="#"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<Home class="h-5 w-5" />
							Dashboard
						</a>
						<a
							href="#"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<ShoppingCart class="h-5 w-5" />
							Orders
						</a>
						<a
							href="#"
							class="flex items-center gap-4 px-2.5 text-foreground"
						>
							<Package class="h-5 w-5" />
							Products
						</a>
						<a
							href="#"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<Users2 class="h-5 w-5" />
							Customers
						</a>
						<a
							href="#"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<LineChart class="h-5 w-5" />
							Settings
						</a>
					</SheetContent>
				</Sheet>
			</header>
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
											Filter
										</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Filter by</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem checked>
										Manager
									</DropdownMenuItem>
									<DropdownMenuItem>User</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<!-- Add User -->
							<Button size="sm" class="h-7 gap-1">
								<PlusCircle class="h-3.5 w-3.5" />
								<span class="sr-only sm:not-sr-only sm:whitespace-nowrap">
									Add User
								</span>
							</Button>
						</div>
					</div>
					<TabsContent value="all">
						<Card>
							<!-- Title and SubTitle -->
							<CardHeader>
								<CardTitle>User Management</CardTitle>
								<CardDescription>
									Manage Users And Edit Theirs Account.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Table>
									<!-- table title and action -->
									<TableHeader>
										<TableRow>
											<TableHead class="hidden w-[100px] sm:table-cell">
												<span class="sr-only">Avatar</span>
											</TableHead>
											<TableHead>Name</TableHead>
											<TableHead>Account Level</TableHead>
											<TableHead class="hidden md:table-cell">
												Price
											</TableHead>
											<TableHead class="hidden md:table-cell">
												Total Sales
											</TableHead>
											<TableHead class="hidden md:table-cell">
												Created Time
											</TableHead>
											<TableHead>
												<span class="sr-only">Actions</span>
											</TableHead>
										</TableRow>
									</TableHeader>
									<!-- content -->
									<TableBody>
										<TableRow>
											<TableCell class="hidden sm:table-cell">
												<img
													alt="Product image"
													class="aspect-square rounded-md object-cover"
													height="64"
													src=""
													width="64"
												>
											</TableCell>
											<TableCell class="font-medium">
												Laser Lemonade Machine
											</TableCell>
											<TableCell>
												<Badge variant="outline">
													Draft
												</Badge>
											</TableCell>
											<TableCell class="hidden md:table-cell">
												$499.99
											</TableCell>
											<TableCell class="hidden md:table-cell">
												25
											</TableCell>
											<TableCell class="hidden md:table-cell">
												2023-07-12 10:42 AM
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
															<span class="sr-only">Toggle menu</span>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem>Edit</DropdownMenuItem>
														<DropdownMenuItem>Delete</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell class="hidden sm:table-cell">
												<img
													alt="Product image"
													class="aspect-square rounded-md object-cover"
													height="64"
													src=""
													width="64"
												>
											</TableCell>
											<TableCell class="font-medium">
												Hypernova Headphones
											</TableCell>
											<TableCell>
												<Badge variant="outline">
													Active
												</Badge>
											</TableCell>
											<TableCell class="hidden md:table-cell">
												$129.99
											</TableCell>
											<TableCell class="hidden md:table-cell">
												100
											</TableCell>
											<TableCell class="hidden md:table-cell">
												2023-10-18 03:21 PM
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
															<span class="sr-only">Toggle menu</span>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem>Edit</DropdownMenuItem>
														<DropdownMenuItem>Delete</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell class="hidden sm:table-cell">
												<img
													alt="Product image"
													class="aspect-square rounded-md object-cover"
													height="64"
													src=""
													width="64"
												>
											</TableCell>
											<TableCell class="font-medium">
												AeroGlow Desk Lamp
											</TableCell>
											<TableCell>
												<Badge variant="outline">
													Active
												</Badge>
											</TableCell>
											<TableCell class="hidden md:table-cell">
												$39.99
											</TableCell>
											<TableCell class="hidden md:table-cell">
												50
											</TableCell>
											<TableCell class="hidden md:table-cell">
												2023-11-29 08:15 AM
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
															<span class="sr-only">Toggle menu</span>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem>Edit</DropdownMenuItem>
														<DropdownMenuItem>Delete</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell class="hidden sm:table-cell">
												<img
													alt="Product image"
													class="aspect-square rounded-md object-cover"
													height="64"
													src=""
													width="64"
												>
											</TableCell>
											<TableCell class="font-medium">
												TechTonic Energy Drink
											</TableCell>
											<TableCell>
												<Badge variant="secondary">
													Draft
												</Badge>
											</TableCell>
											<TableCell class="hidden md:table-cell">
												$2.99
											</TableCell>
											<TableCell class="hidden md:table-cell">
												0
											</TableCell>
											<TableCell class="hidden md:table-cell">
												2023-12-25 11:59 PM
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
															<span class="sr-only">Toggle menu</span>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem>Edit</DropdownMenuItem>
														<DropdownMenuItem>Delete</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell class="hidden sm:table-cell">
												<img
													alt="Product image"
													class="aspect-square rounded-md object-cover"
													height="64"
													src=""
													width="64"
												>
											</TableCell>
											<TableCell class="font-medium">
												Gamer Gear Pro Controller
											</TableCell>
											<TableCell>
												<Badge variant="outline">
													Active
												</Badge>
											</TableCell>
											<TableCell class="hidden md:table-cell">
												$59.99
											</TableCell>
											<TableCell class="hidden md:table-cell">
												75
											</TableCell>
											<TableCell class="hidden md:table-cell">
												2024-01-01 12:00 AM
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
															<span class="sr-only">Toggle menu</span>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem>Edit</DropdownMenuItem>
														<DropdownMenuItem>Delete</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell class="hidden sm:table-cell">
												<img
													alt="Product image"
													class="aspect-square rounded-md object-cover"
													height="64"
													src=""
													width="64"
												>
											</TableCell>
											<TableCell class="font-medium">
												Luminous VR Headset
											</TableCell>
											<TableCell>
												<Badge variant="outline">
													Active
												</Badge>
											</TableCell>
											<TableCell class="hidden md:table-cell">
												$199.99
											</TableCell>
											<TableCell class="hidden md:table-cell">
												30
											</TableCell>
											<TableCell class="hidden md:table-cell">
												2024-02-14 02:14 PM
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
															<span class="sr-only">Toggle menu</span>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem>Edit</DropdownMenuItem>
														<DropdownMenuItem>Delete</DropdownMenuItem>
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
