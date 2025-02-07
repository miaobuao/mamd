import type { JWTPayload as BaseJwtPayload } from 'jose'
import { jwtVerify, SignJWT } from 'jose'

export async function signToken(
	payload: JwtPayloadData,
	{
		issuer,
		exp,
	}: {
		issuer?: string
		exp?: string
	} = {},
) {
	const config = useRuntimeConfig()
	const secret = new TextEncoder().encode(config.JWT_SECRET)
	return await new SignJWT({ data: payload })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuer(issuer ?? config.JWT_ISSUER)
		.setExpirationTime(exp ?? config.OAUTH_JWT_EXPIRES_IN)
		.sign(secret)
}

export async function verifyToken(token: string) {
	try {
		const config = useRuntimeConfig()
		const secret = new TextEncoder().encode(config.JWT_SECRET)
		return await jwtVerify<JwtPayload>(token, secret, {
			issuer: config.JWT_ISSUER,
		})
	}
	catch {
		return false
	}
}

export interface JwtPayload extends BaseJwtPayload {
	data: JwtPayloadData
}

export interface JwtPayloadData {
	user: {
		id: string
	}
	remember?: boolean
}
