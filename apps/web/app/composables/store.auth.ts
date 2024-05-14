export interface UserInfo {
	id: number
	username: string
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

	const isAuth = computed(() => !!userInfo.value)

	return {
		userInfo,
		updateUserInfo,
		isAuth,
		auth,
	}
})
