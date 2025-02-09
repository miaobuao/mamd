export const AssertSessionValid = defineRequestMiddleware((event) => {
	if (!event.context.user?.id) {
		throw new ForbiddenErrorWithI18n(i18n.error.permissionDenied)
	}
})
