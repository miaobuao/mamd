export default defineEventHandler<{}, Promise<{
	id: string
	username: string
	isAdmin: boolean
}>>(async ({ context: { user } }) => {
	if (!user) {
		throw new BadRequestErrorWithI18n(i18n.error.loginFailed)
	}
	return {
		id: user.id,
		username: user.username,
		isAdmin: user.isAdmin,
	}
})
