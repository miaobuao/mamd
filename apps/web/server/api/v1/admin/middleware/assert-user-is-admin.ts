export const AssertUserIsAdmin = defineRequestMiddleware(async (event) => {
	if (!event.context.user?.isAdmin) {
		throw new ForbiddenErrorWithI18n(i18n.error.permissionDenied)
	}
})
