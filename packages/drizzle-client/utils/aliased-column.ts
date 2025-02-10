import type { AnyColumn, GetColumnData, SQL } from 'drizzle-orm'

export function aliasedColumn<T extends AnyColumn>(column: T, alias: string): SQL.Aliased<GetColumnData<T>> {
	return column.getSQL().mapWith(column.mapFromDriverValue).as(alias)
}
