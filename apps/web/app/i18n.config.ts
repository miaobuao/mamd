import { en, zh } from './utils/i18n'

export default defineI18nConfig(() => ({
	legacy: false,
	locale: 'en',
	fallbackLocale: 'en',
	messages: {
		zh,
		en,
	},
}))
