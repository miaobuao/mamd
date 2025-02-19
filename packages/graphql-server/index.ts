import type { DrizzleClient } from 'drizzle-client'
import { buildSchema } from 'drizzle-graphql'
import { createYoga } from 'graphql-yoga'

interface CreateGraphQLServerOptions {
	dbClient: DrizzleClient
	graphqlEndpoint?: string
}

export function createGraphQLServer({ dbClient, graphqlEndpoint }: CreateGraphQLServerOptions) {
	const { schema } = buildSchema(dbClient)
	const yoga = createYoga({ schema, graphqlEndpoint })
	return yoga
}
