<script setup lang="ts">
import '@/assets/style/global.css'
import {
	useLocalStorage,
	useNavigatorLanguage,
	usePreferredLanguages,
} from '@vueuse/core'
import { Toaster } from '@/components/ui/sonner'

const { setLocale: _setLocale } = useI18n()

function setLocale(locale: string) {
	if (/[a-z]+-[a-z]+/i.test(locale)) {
		_setLocale(locale.split('-')[0]!.toLowerCase())
	}
	else if (typeof locale === 'string' && locale.length === 2) {
		_setLocale(locale.toLocaleLowerCase())
	}
	else {
		_setLocale('en')
	}
}

onMounted(() => {
	const preferredLanguage = usePreferredLanguages()
	const navigatorLanguage = useNavigatorLanguage()
	const storageLocale = useLocalStorage<string | undefined>('locale', undefined)
	watch(
		[ preferredLanguage, navigatorLanguage.language, storageLocale ],
		(value) => {
			const [ preferredLanguage, navigatorLanguage, storageLocale ] = value
			if (storageLocale) {
				setLocale(storageLocale)
			}
			else if (preferredLanguage.length) {
				const language = preferredLanguage[0]
				if (language) {
					setLocale(language)
				}
			}
			else if (navigatorLanguage) {
				setLocale(navigatorLanguage)
			}
		},
		{ immediate: true },
	)
})
</script>

<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
	<Toaster />
</template>
