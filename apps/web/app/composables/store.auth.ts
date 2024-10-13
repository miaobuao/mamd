export interface UserInfo {
	id: string
	username: string
	isAdmin: boolean
}

export const useAuthStore = defineStore('auth', () => {
	const { $trpc } = useNuxtApp()
	const userInfo = ref<UserInfo>()

	function updateUserInfo(info: UserInfo) {
		userInfo.value = info
	}

	function auth() {
		return $trpc.user.auth
			.mutate()
			.then((info) => {
				updateUserInfo(info)
				return info
			})
			.catch(() => null)
	}

	function logout() {
		return $trpc.user.logout.mutate()
	}

	const isAuth = computed(() => !!userInfo.value)

	return {
		userInfo,
		updateUserInfo,
		isAuth,
		auth,
		logout,
	}
})
