import { StatusCodes } from 'http-status-codes'

export class ErrorWithI18n extends Error {
	constructor(
		public readonly httpStatusCode: StatusCodes,
		public readonly i18n: string,
		public readonly i18nParams?: Record<string, string>,
	) {
		super(i18n)
	}
}

export class ForbiddenErrorWithI18n extends ErrorWithI18n {
	constructor(i18n: string, i18nParams?: Record<string, string>) {
		super(StatusCodes.FORBIDDEN, i18n, i18nParams)
	}
}

export class UnauthorizedErrorWithI18n extends ErrorWithI18n {
	constructor(i18n: string, i18nParams?: Record<string, string>) {
		super(StatusCodes.UNAUTHORIZED, i18n, i18nParams)
	}
}

export class BadRequestErrorWithI18n extends ErrorWithI18n {
	constructor(i18n: string, i18nParams?: Record<string, string>) {
		super(StatusCodes.BAD_REQUEST, i18n, i18nParams)
	}
}
