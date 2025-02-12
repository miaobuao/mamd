import process from 'node:process'
import { isNil } from 'lodash-es'

const MINIO_PROXY_PATH = process.env.MINIO_PROXY_PATH || '/api/oss'
const MINIO_USE_SSL = process.env.MINIO_USE_SSL?.toLowerCase() === 'true'
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT!
const MINIO_API_PORT = isNil(process.env.MINIO_API_PORT) ? undefined : Number.parseInt(process.env.MINIO_API_PORT!)

export default defineNuxtConfig({
	future: {
		compatibilityVersion: 4,
	},

	telemetry: false,

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
		devProxy: {
			[MINIO_PROXY_PATH]: {
				target: `${MINIO_USE_SSL ? 'https' : 'http'}://${MINIO_ENDPOINT}:${MINIO_API_PORT}`,
				prependPath: true,
				changeOrigin: true,
			},
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

	compatibilityDate: '2025-02-11',

})
