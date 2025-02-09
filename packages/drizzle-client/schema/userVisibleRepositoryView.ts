import { eq } from 'drizzle-orm'
import { pgView } from 'drizzle-orm/pg-core'
import { pick } from 'lodash-es'
import { aliasedColumn } from '../utils/alias-column'
import { RepositoryTable } from './repository'
import { UserTable } from './user'
import { VisibleRepositoryTable } from './visibleRepository'

export const UserVisibleRepositoryView = pgView('user_visible_repository_view')
	.as((qb) => qb
		.select({
			user: {
				...pick(UserTable, 'username', 'isAdmin', 'isDeleted'),
				id: aliasedColumn(UserTable.id, 'user_id'),
			},
			repository: {
				...pick(RepositoryTable, 'name', 'linkedFolderId', 'creatorId', 'ctime', 'mtime'),
				id: aliasedColumn(RepositoryTable.id, 'repository_id'),
			},
		})
		.from(UserTable)
		.innerJoin(VisibleRepositoryTable, eq(UserTable.id, VisibleRepositoryTable.userId))
		.innerJoin(RepositoryTable, eq(RepositoryTable.id, VisibleRepositoryTable.repositoryId)),
	)
