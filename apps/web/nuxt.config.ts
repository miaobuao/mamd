import process from 'node:process'
import { isNil } from 'lodash-es'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	future: {
		compatibilityVersion: 4,
	},

	build: {
		transpile: [ 'trpc-nuxt', 'rxjs' ],
	},

	modules: [
		'@formkit/auto-animate/nuxt',
		'@nuxtjs/i18n',
		'@pinia/nuxt',
		'shadcn-nuxt',
		'@nuxtjs/tailwindcss',
		'@nuxtjs/color-mode',
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
		vueI18n: './i18n/i18n.config.ts',
		strategy: 'no_prefix',
	},

	shadcn: {
		prefix: '',
		componentDir: './app/components/ui',
	},

	colorMode: {
		classSuffix: '',
	},

	devtools: { enabled: true },

	compatibilityDate: '2024-11-13',

	runtimeConfig: {
		// JWT
		JWT_SECRET: process.env.JWT_SECRET!,
		JWT_ISSUER: process.env.JWT_ISSUER!,
		OAUTH_JWT_EXPIRES_IN: process.env.OAUTH_JWT_EXPIRES_IN!,

		// MINIO
		MINIO_ENDPOINT: process.env.MINIO_ENDPOINT!,
		MINIO_API_PORT: isNil(process.env.MINIO_API_PORT) ? undefined : Number.parseInt(process.env.MINIO_API_PORT!),
		MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY!,
		MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY!,
		MINIO_USE_SSL: isNil(process.env.MINIO_USE_SSL) ? undefined : process.env.MINIO_USE_SSL.toLowerCase() === 'true',

		DATABASE_URL: process.env.DATABASE_URL!,
	},
})
