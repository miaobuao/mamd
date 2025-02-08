export interface RepositoryModel {
	id: string
	name: string
	creator: {
		id: string
		username: string
	}
	linkedFolder: {
		id: string
		name: string
	}
}
