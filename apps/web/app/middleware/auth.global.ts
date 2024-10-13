const LOGIN_ROUTE = '/login'
const REGISTER_ROUTE = '/register'

export default defineNuxtRouteMiddleware(async (to) => {
	const { $pinia, $trpc } = useNuxtApp()
	const auth = useAuthStore($pinia)

	if (auth.isAuth) {
		return
	}

	await useAsyncData('user-auth', () => auth.auth())

	if (auth.isAuth) {
		const from = typeof to.query.from === 'string' ? to.query.from : '/'
		switch (to.path) {
			case LOGIN_ROUTE:
			case REGISTER_ROUTE:
				return navigateTo(from)
		}
		return
	}

	const { data: { value: hasAdmin } } = await $trpc.user.hasAdminAccount.useQuery()

	if (hasAdmin) {
		if (to.path === LOGIN_ROUTE) {
			return
		}
		else if (to.path === REGISTER_ROUTE) {
			return navigateTo({ path: LOGIN_ROUTE, query: { from: to.query.from } })
		}
		return navigateTo({ path: LOGIN_ROUTE, query: { from: to.fullPath } })
	}
	else if (to.path !== REGISTER_ROUTE) {
		return navigateTo({ path: REGISTER_ROUTE, query: { from: to.fullPath } })
	}
})
