// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	future: {
		compatibilityVersion: 4,
	},

	build: {
		transpile: [ 'trpc-nuxt' ],
	},

	modules: [
		'@formkit/auto-animate/nuxt',
		'@nuxtjs/i18n',
		'@pinia/nuxt',
		'shadcn-nuxt',
		'@nuxtjs/tailwindcss',
	],

	nitro: {
		experimental: {
			wasm: true,
		},
	},

	i18n: {
		defaultLocale: 'zh',
		locales: [ 'en', 'zh' ],
		lazy: true,
		vueI18n: './app/i18n.config.ts',
	},

	shadcn: {
		prefix: '',
		componentDir: './app/components/ui',
	},

	devtools: { enabled: true },

	compatibilityDate: '2024-09-21',
})
