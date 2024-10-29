export function makeRepoUrl(repoId: string, ...parts: (string | undefined)[]) {
	return `/repo/${repoId}/${parts.filter(Boolean).join('/')}`
}
