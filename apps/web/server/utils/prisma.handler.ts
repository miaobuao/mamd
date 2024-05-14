import type { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

const errorCodeToName = {
	P1000: 'AuthenticationFailedError',
	P1001: 'DatabaseUnreachableError',
	P1002: 'DatabaseTimeoutError',
	P1003: 'DatabaseDoesNotExistError',
	P1008: 'OperationTimeoutError',
	P1009: 'DatabaseAlreadyExistsError',
	P1010: 'UserAccessDeniedError',
	P1011: 'TlsConnectionError',
	P1012: 'SchemaValidationError',
	P1013: 'InvalidDatabaseStringError',
	P1014: 'UnderlyingModelError',
	P1015: 'UnsupportedDatabaseVersionError',
	P1016: 'IncorrectParametersError',
	P1017: 'ServerClosedConnectionError',
	P2000: 'ValueTooLongError',
	P2001: 'RecordDoesNotExistError',
	P2002: 'UniqueConstraintError',
	P2003: 'ForeignKeyConstraintError',
	P2004: 'DatabaseConstraintError',
	P2005: 'InvalidFieldValueError',
	P2006: 'InvalidValueError',
	P2007: 'DataValidationError',
	P2008: 'QueryParsingError',
	P2009: 'QueryValidationError',
	P2010: 'RawQueryFailedError',
	P2011: 'NullConstraintViolationError',
	P2012: 'MissingRequiredValueError',
	P2013: 'MissingRequiredArgumentError',
	P2014: 'RelationViolationError',
	P2015: 'RelatedRecordNotFoundError',
	P2016: 'QueryInterpretationError',
	P2017: 'RecordsNotConnectedError',
	P2018: 'ConnectedRecordsNotFoundError',
	P2019: 'InputError',
	P2020: 'ValueOutOfRangeError',
	P2021: 'TableDoesNotExistError',
	P2022: 'ColumnDoesNotExistError',
	P2023: 'InconsistentColumnDataError',
	P2024: 'ConnectionPoolTimeoutError',
	P2025: 'OperationFailedError',
	P2026: 'UnsupportedFeatureError',
	P2027: 'DatabaseQueryExecutionErrors',
	P2028: 'TransactionApiError',
	P2030: 'FullTextIndexNotFoundError',
	P2031: 'MongoDBReplicaSetError',
	P2033: 'NumberOutOfRangeError',
	P2034: 'TransactionConflictError',
	P3000: 'DatabaseCreationFailedError',
	P3001: 'MigrationDestructiveChangesError',
	P3002: 'MigrationRollbackError',
	P3003: 'MigrationFormatChangedError',
	P3004: 'SystemDatabaseAlterationError',
	P3005: 'NonEmptySchemaError',
	P3006: 'FailedMigrationError',
	P3007: 'PreviewFeaturesBlockedError',
	P3008: 'MigrationAlreadyAppliedError',
	P3009: 'FailedMigrationsError',
	P3010: 'MigrationNameTooLongError',
	P3011: 'MigrationNotFoundForRollbackError',
	P3012: 'MigrationNotInFailedStateError',
	P3013: 'ProviderArraysNotSupportedError',
	P3014: 'ShadowDatabaseCreationError',
	P3015: 'MigrationFileNotFoundError',
	P3016: 'DatabaseResetFallbackFailedError',
	P3017: 'MigrationNotFoundError',
	P3018: 'MigrationFailedToApplyError',
	P3019: 'ProviderMismatchError',
	P3020: 'ShadowDatabaseDisabledError',
	P3021: 'NoForeignKeysError',
	P3022: 'NoDirectDdlError',
	P4000: 'IntrospectionFailedError',
	P4001: 'EmptyIntrospectedDatabaseError',
	P4002: 'InconsistentIntrospectedSchemaError',
	P5000: 'DataProxyRequestError',
	P5001: 'DataProxyRetryRequestError',
	P5002: 'DataProxyInvalidDataSourceError',
	P5003: 'DataProxyResourceNotFoundError',
	P5004: 'DataProxyFeatureNotImplementedError',
	P5005: 'DataProxySchemaUploadError',
	P5006: 'DataProxyUnknownServerError',
	P5007: 'DataProxyUnauthorizedError',
	P5008: 'DataProxyUsageExceededError',
	P5009: 'DataProxyRequestTimeoutError',
	P5010: 'DataProxyFetchError',
	P5011: 'DataProxyInvalidRequestParametersError',
	P5012: 'DataProxyUnsupportedEngineVersionError',
	P5013: 'DataProxyEngineStartupError',
	P5014: 'DataProxyUnknownEngineStartupError',
	P5015: 'DataProxyInteractiveTransactionError',
} as const

type PrismaErrorCode = keyof typeof errorCodeToName
type PrismaErrorName = (typeof errorCodeToName)[PrismaErrorCode]
type PrismaError = PrismaClientKnownRequestError & {
	code: PrismaErrorCode
	meta: Record<string, any>
}
type Handler<T> = (error: PrismaError) => T

type PrismaErrorHandler<T> = Record<PrismaErrorName, Handler<T>> & {
	default?: Handler<T>
}

export function handlePrismaError<T>(
	err: PrismaError,
	handler: Partial<PrismaErrorHandler<T>>,
) {
	const name = errorCodeToName[err.code]
	if (typeof handler[name] === 'function')
		return handler[name](err)

	if (typeof handler.default === 'function')
		return handler.default(err)

	throw err
}

export function createPrismaErrorHandler<T>(
	handler: Partial<PrismaErrorHandler<T>>,
) {
	return (err: PrismaError) => {
		handlePrismaError(err, handler)
	}
}
