import { isClient } from '@vueuse/core'
import { Subject } from 'rxjs'

export interface UserInfo {
	uuid: string
	username: string
	isAdmin: boolean
}

export const LogoutSubject = new Subject<void>()

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
		LogoutSubject.next()
		userInfo.value = undefined
		if (isClient) {
			sessionStorage.clear()
			localStorage.clear()
		}
		return $trpc.user.logout.mutate().then(() => {
			if (isClient) {
				window.open('/')
				window.close()
			}
		})
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
