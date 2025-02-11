import { eq } from 'drizzle-orm'
import { pgView } from 'drizzle-orm/pg-core'
import { pick } from 'lodash-es'
import { aliasedColumn } from '../utils/aliased-column'
import { RepositoryTable } from './repository'
import { UserTable } from './user'

export const RepositoryCreatorView = pgView('repository_creator_view')
	.as((qb) => {
		return qb
			.select({
				creator: {
					...pick(UserTable, 'username', 'isAdmin', 'isDeleted'),
					id: aliasedColumn(UserTable.id, 'user_id'),
				},
				repository: {
					...pick(RepositoryTable, 'name', 'linkedFolderId', 'creatorId', 'ctime', 'mtime'),
					id: aliasedColumn(RepositoryTable.id, 'repository_id'),
				},
			})
			.from(UserTable)
			.innerJoin(RepositoryTable, eq(RepositoryTable.creatorId, UserTable.id))
	})
