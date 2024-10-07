const LOGIN_ROUTE = '/user/login'
const REGISTER_ROUTE = '/user/register'

export default defineNuxtRouteMiddleware(async (to) => {
	const { $pinia, $trpc } = useNuxtApp()
	const auth = useAuthStore($pinia)

	if (auth.isAuth) {
		return
	}

	await useAsyncData('user-auth', () => auth.auth())

	if (auth.isAuth && to.path === LOGIN_ROUTE) {
		if (to.query.from) {
			return navigateTo(to.query.from as string)
		}
		return navigateTo('/')
	}

	if (auth.isAuth) {
		return
	}

	const { data: hasAdminAccount } = await $trpc.user.hasAdminAccount.useQuery()

	if (hasAdminAccount.value) {
		if (to.path === LOGIN_ROUTE) {
			return
		}
		return navigateTo({ path: LOGIN_ROUTE, query: { from: to.fullPath } })
	}
	else if (to.path !== REGISTER_ROUTE) {
		return navigateTo({ path: REGISTER_ROUTE, query: { from: to.fullPath } })
	}
})
