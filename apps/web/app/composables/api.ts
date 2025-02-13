export function useApi() {
	const $fetch = useRequestFetch()

	const api: typeof useFetch = (url, opt) => useFetch(url, {
		...opt,
		$fetch,
	})
	return api
}
