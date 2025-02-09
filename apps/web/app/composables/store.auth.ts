import { isClient } from '@vueuse/core'
import { Subject } from 'rxjs'

export interface UserInfo {
	id: string
	username: string
	isAdmin: boolean
}

export const LogoutSubject = new Subject<void>()

export const useAuthStore = defineStore('auth', () => {
	const { $api } = useNuxtApp()
	const userInfo = ref<UserInfo>()

	function updateUserInfo(info?: UserInfo) {
		userInfo.value = info
	}

	function auth() {
		return $api('/api/v1/session')
			.then(({ data }) => {
				updateUserInfo(data.value)
				return data.value
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
		return $api('/api/v1/session', { method: 'delete' }).then(() => {
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
