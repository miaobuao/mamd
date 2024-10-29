import antfu from '@antfu/eslint-config'

export default antfu({
	formatters: true,
	vue: true,
}, {
	rules: {
		'jsonc/indent': [ 'error', 'tab' ],
		'no-console': 'error',
		'style/array-bracket-spacing': [ 'error', 'always' ],
		'style/indent': [ 'error', 'tab' ],
		'style/no-tabs': 'off',
		'symbol-description': 'off',
		'ts/no-unsafe-function-type': 'off',
		'unused-imports/no-unused-imports': 'error',
		'vue/array-bracket-spacing': [ 'error', 'always' ],
		'vue/html-indent': [ 'error', 'tab' ],
		'antfu/no-top-level-await': 'off',
	},
	ignores: [ '**/node_modules' ],
})
