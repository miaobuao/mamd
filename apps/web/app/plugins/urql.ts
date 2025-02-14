import urql, {
	cacheExchange,
	fetchExchange,
	ssrExchange,
} from '@urql/vue'
import { process } from 'std-env'

export default defineNuxtPlugin((nuxtApp) => {
	const ssr = ssrExchange({
		isClient: import.meta.client,
	})

	if (import.meta.server) {
		nuxtApp.hook('app:rendered', () => {
			const extractData = ssr.extractData()
			nuxtApp.payload?.data && (nuxtApp.payload.data.urql = extractData)
		})
	}

	if (import.meta.client) {
		nuxtApp.hook('app:created', () => {
			nuxtApp.payload?.data && ssr.restoreData(nuxtApp.payload.data.urql)
		})
	}

	const exchanges = [ cacheExchange, ssr, fetchExchange ]
	const GQL_SUFFIX = '/api/gql'
	nuxtApp.vueApp.use(urql, {
		url: import.meta.client ? GQL_SUFFIX : `http://localhost:${process.env.NITRO_PORT}${GQL_SUFFIX}`,
		exchanges,
		fetchOptions: () => ({
			headers: {
				cookie: nuxtApp.ssrContext?.event.node.req.headers.cookie ?? '',
			},
		}),
	})
})
