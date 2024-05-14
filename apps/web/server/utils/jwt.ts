import { type JWTPayload as BaseJwtPayload, SignJWT, jwtVerify } from 'jose'

const config = useRuntimeConfig()

const secret = new TextEncoder().encode(config.JWT_SECRET)

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
	return await new SignJWT({ data: payload })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuer(issuer ?? config.JWT_ISSUER)
		.setExpirationTime(exp ?? config.OAUTH_EXPIRES_IN)
		.sign(secret)
}

export async function verifyToken(token: string) {
	try {
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
	userId: number
	remember?: boolean
}
