type FetchType = typeof useFetch

export default defineNuxtPlugin(() => {
	const api: FetchType = (api, options) => {
		const headers = useRequestHeaders([ 'cookie' ])
		return useFetch(api, {
			...options,
			headers,
		})
	}

	return {
		provide: {
			api,
		},
	}
})
