import { useDrizzleClient } from 'drizzle-client'
import { buildSchema } from 'drizzle-graphql'
import { createYoga } from 'graphql-yoga'

const { schema } = buildSchema(useDrizzleClient(config.DATABASE_URL))

const yoga = createYoga({ schema, graphqlEndpoint: '/api/gql' })

export default defineEventHandler(async (event) => {
	const { req, res } = event.node
	return yoga(req, res)
})
