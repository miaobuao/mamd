export function putObject(url: string, file: File) {
	return fetch(url, {
		method: 'PUT',
		body: file,
	})
}
