export interface FolderModel {
	id: string
	name: string
	repositoryId: string
	fullPath: string
	files: {
		id: string
		name: string
	}[]
	folders: {
		id: string
		name: string
	}[]
}
