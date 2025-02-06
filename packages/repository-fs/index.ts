import { basename } from 'node:path'
import { type DrizzleCilent, FileTable, FolderTable } from 'drizzle-client'
import { and, eq } from 'drizzle-orm'

export class RepositoryFileSytem {
	constructor(
		public readonly db: DrizzleCilent,
		public readonly id: string,
	) {}

	async isDir(path: string) {
		const file = await this.db.query.FileTable.findFirst({
			where: and(
				eq(FileTable.repositoryId, this.id),
				eq(FileTable.fullPath, path),
			),
		})
		return !file
	}

	async getDirectory(path: string) {
		return await this.db.query.FolderTable.findFirst({
			where: and(
				eq(FolderTable.repositoryId, this.id),
				eq(FolderTable.fullPath, path),
			),
		})
	}

	async getFile(path: string) {
		return await this.db.query.FileTable.findFirst({
			where: and(
				eq(FileTable.repositoryId, this.id),
				eq(FileTable.fullPath, path),
			),
		})
	}

	async stat(path: string) {
		const file = await this.getFile(path)
		if (file) {
			return {
				isDir: false,
				...file,
			}
		}
		const folder = await this.getDirectory(path)
		if (folder) {
			return {
				isDir: true,
				...folder,
			}
		}
		return undefined
	}

	async renameDir(source: string, target: string) {
		return await this.db.update(FolderTable)
			.set({ fullPath: target })
			.where(and(
				eq(FolderTable.repositoryId, this.id),
				eq(FolderTable.fullPath, source),
			))
			.returning({ id: FolderTable.id })
			.then((d) => d.at(0))
	}

	async renameFile(source: string, target: string) {
		return await this.db.update(FileTable)
			.set({ fullPath: target })
			.where(and(
				eq(FileTable.repositoryId, this.id),
				eq(FileTable.fullPath, source),
			))
			.returning({ id: FileTable.id })
			.then((d) => d.at(0))
	}

	async rename(source: string, target: string) {
		const renameDirResult = await this.renameDir(source, target)
		if (renameDirResult) {
			return renameDirResult
		}
		return await this.renameFile(source, target)
	}

	async addDir(parentId: string, path: string) {
		return await this.db.insert(FolderTable).values({
			repositoryId: this.id,
			name: basename(path),
			fullPath: path,
			parentId,
		}).onConflictDoUpdate({
			target: [ FolderTable.repositoryId, FolderTable.fullPath ],
			set: {
				parentId,
			},
		}).returning({
			id: FolderTable.id,
		}).then((d) => d.at(0))
	}

	async addFile(parentId: string, path: string) {
		return await this.db.insert(FileTable).values({
			repositoryId: this.id,
			name: basename(path),
			fullPath: path,
			parentId,
		}).onConflictDoUpdate({
			target: [ FileTable.repositoryId, FileTable.fullPath ],
			set: {
				parentId,
			},
		}).returning({
			id: FileTable.id,
		}).then((d) => d.at(0))
	}

	async existDir(path: string) {
		return await this.db.query.FolderTable.findFirst({
			where: and(
				eq(FolderTable.repositoryId, this.id),
				eq(FolderTable.fullPath, path),
			),
			columns: {
				id: true,
			},
		})
	}

	async existFile(path: string) {
		return await this.db.query.FileTable.findFirst({
			where: and(
				eq(FileTable.repositoryId, this.id),
				eq(FileTable.fullPath, path),
			),
			columns: {
				id: true,
			},
		})
	}

	async removeFile(path: string) {
		return await this.db.delete(FileTable).where(
			and(
				eq(FileTable.repositoryId, this.id),
				eq(FileTable.fullPath, path),
			),
		)
	}

	async removeDir(path: string) {
		return await this.db.delete(FolderTable).where(
			and(
				eq(FolderTable.repositoryId, this.id),
				eq(FolderTable.fullPath, path),
			),
		)
	}
}
