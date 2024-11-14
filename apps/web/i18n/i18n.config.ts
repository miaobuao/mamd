import en from './lang/en'
import zh from './lang/zh'

export default defineI18nConfig(() => ({
	legacy: false,
	locale: 'en',
	fallbackLocale: 'en',
	messages: {
		zh,
		en,
	},
}))
