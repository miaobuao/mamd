export function makeRepoUrl(repoId: string, ...parts: string[]) {
	return `/repo/${repoId}/${parts.filter(Boolean).join('/')}`
}
