const LOGIN_ROUTE = '/user/login'

export default defineNuxtRouteMiddleware(async (to) => {
	const { $pinia } = useNuxtApp()
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

	if (!auth.isAuth) {
		if (to.path === '/user/register') {
			return
		}
		if (to.path !== LOGIN_ROUTE) {
			return navigateTo({ path: LOGIN_ROUTE, query: { from: to.fullPath } })
		}
	}
})
