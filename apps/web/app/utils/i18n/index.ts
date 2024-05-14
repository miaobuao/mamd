import { cloneDeep, isPlainObject } from 'lodash-es'

import en from './lang/en'
import zh from './lang/zh'

export { en, zh }

export type LangPackage = typeof zh & typeof en

export function buildLanguagePack(t: TranslateFunc) {
	const text = Object.assign({}, cloneDeep(en), cloneDeep(zh))
	ReplaceWithTranslateFunction(t)(text)
	return text as unknown as StringToI18nText<typeof text>
}

export function buildLanguageSource() {
	const source = Object.assign({}, cloneDeep(en), cloneDeep(zh))
	ReplaceWithStringPath()(source)
	return source
}

function DFS<T extends Function>(cb: T) {
	function dfs(obj: any, prefix: string[] = []) {
		for (const [ key, value ] of Object.entries(obj)) {
			if (typeof value === 'string')
				obj[key] = cb([ ...prefix, key ])
			else if (isPlainObject(value))
				dfs(value, [ ...prefix, key ])
		}
	}
	return dfs
}

function ReplaceWithStringPath() {
	return DFS((prefix: string[]) => prefix.join('.'))
}

function ReplaceWithTranslateFunction(t: TranslateFunc) {
	return DFS(
		(prefix: string[]) => (args?: I18nParams) => t(prefix.join('.'), args ?? {}),
	)
}

type TranslateFunc = (
	template: string,
	args: Record<string, unknown>
) => string

type I18nParams = Record<string, string | number>

type StringToI18nText<T> = {
	[K in keyof T]: T[K] extends string
		? (args?: I18nParams) => string
		: StringToI18nText<T[K]>;
}
