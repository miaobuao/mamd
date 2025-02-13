import type { CodegenConfig } from '@graphql-codegen/cli'
import process from 'node:process'
import consola from 'consola'
import 'dotenv/config'

const schemaUrl = `http://localhost:${process.env.NITRO_PORT}/api/gql`

consola.log(schemaUrl)

const config: CodegenConfig = {
	schema: schemaUrl,
	documents: [ 'apps/web/app/**/*.{vue,ts,tsx}' ],
	generates: {
		'./apps/web/shared/gql/': {
			preset: 'client',
			config: {
				useTypeImports: true,
			},
			plugins: [],
		},
	},
	watch: true,
	ignoreNoDocuments: true,
}
export default config
