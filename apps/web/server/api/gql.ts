import { createGraphQLServer } from '@repo/graphql-server'
import { useDrizzleClient } from 'drizzle-client'

const gql = createGraphQLServer({
	dbClient: useDrizzleClient(config.DATABASE_URL),
	graphqlEndpoint: '/api/gql',
})

export default defineEventHandler(async (event) => {
	const { req, res } = event.node
	return gql(req, res)
})
