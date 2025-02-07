export function removeOriginInUrl(url: string) {
	try {
		const parsedUrl = new URL(url)
		return url.slice(parsedUrl.origin.length)
	}
	catch {
		return url
	}
}
