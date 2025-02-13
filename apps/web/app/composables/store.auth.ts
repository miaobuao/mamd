import type { TypeOf } from 'zod'
import { isClient } from '@vueuse/core'
import { Subject } from 'rxjs'

export interface UserInfo {
	id: string
	username: string
	isAdmin: boolean
}

export const LogoutSubject = new Subject<void>()

export const useAuthStore = defineStore('auth', () => {
	const $api = useApi()

	const userInfo = ref<UserInfo>()

	function updateUserInfo(info: UserInfo) {
		userInfo.value = info
	}

	async function auth() {
		const res = await $api('/api/v1/session')
		if (res.data.value) {
			updateUserInfo(res.data.value)
			return res.data.value
		}
		return null
	}

	async function login(form: TypeOf<typeof UserLoginSubmitFormValidator>) {
		const { data } = await $api('/api/v1/session', {
			method: 'post',
			body: form,
		})
		if (data.value) {
			updateUserInfo(data.value)
			return true
		}
		return false
	}

	function logout() {
		LogoutSubject.next()
		userInfo.value = undefined
		if (isClient) {
			sessionStorage.clear()
			localStorage.clear()
		}
		return $api('/api/v1/session', {
			method: 'delete',
		}).then(() => {
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
		login,
		logout,
	}
})
