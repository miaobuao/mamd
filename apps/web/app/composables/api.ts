type FetchType = typeof useFetch

export const useApi: FetchType = (url, options) => {
	return useFetch(url, {
		headers: useRequestHeaders([ 'cookie' ]),
		...options,
	})
}
