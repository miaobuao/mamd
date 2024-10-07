import process from 'node:process'

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

	runtimeConfig: {
		OAUTH_JWT_EXPIRES_IN: process.env.OAUTH_JWT_EXPIRES_IN,
		JWT_SECRET: process.env.JWT_SECRET,
		JWT_ISSUER: process.env.JWT_ISSUER,
	},
})
