import urql, { cacheExchange, fetchExchange, ssrExchange } from '@urql/vue'

export default defineNuxtPlugin((nuxtApp) => {
	const ssr = ssrExchange({
		isClient: import.meta.client,
	})

	if (import.meta.server) {
		nuxtApp.hook('app:rendered', () => {
			nuxtApp.payload?.data && (nuxtApp.payload.data.urql = ssr.extractData())
		})
	}

	if (import.meta.client) {
		nuxtApp.hook('app:created', () => {
			nuxtApp.payload?.data && ssr.restoreData(nuxtApp.payload.data.urql)
		})
	}

	const exchanges = [ cacheExchange, ssr, fetchExchange ]
	nuxtApp.vueApp.use(urql, {
		url: '/api/gql',
		exchanges,
	})
})
