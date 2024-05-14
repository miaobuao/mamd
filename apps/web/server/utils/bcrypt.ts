import bcrypt from 'bcryptjs'

export async function bcryptEncrypt(password: string) {
	return bcrypt.hash(password, await bcrypt.genSalt(13))
}

export function bcryptVerify(password: string, hashed: string) {
	return bcrypt.compare(password, hashed)
}

export function BcryptVerifier(password: string) {
	return (hashed: string) => bcryptVerify(password, hashed)
}
