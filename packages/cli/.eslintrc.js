const defaultRules = {
	// No console statements in production
	'no-console': process.env.NODE_ENV !== 'development' ? 'error' : 'off',
	// No debugger statements in production
	'no-debugger': process.env.NODE_ENV !== 'development' ? 'error' : 'off',
	// Enforce prettier formatting
	'prettier/prettier': 'error',
};

module.exports = {
	// Stop looking for ESLint configurations in parent folders
	root: true,
	// Global variables: Browser and Node.js
	env: {
		browser: true,
		node: true,
	},
	// Basic configuration for js files
	plugins: ['@typescript-eslint', 'prettier'],
	extends: ['eslint:recommended', 'prettier'],
	rules: defaultRules,
	parserOptions: {
		ecmaVersion: 2020,
	},
	overrides: [
		// Parse rollup configuration as module
		{
			files: ['rollup.config.js', 'vite.config.js'],
			parserOptions: {
				sourceType: 'module',
			},
		},
		{
			files: ['**/*.test.js'],
			env: {
				jest: true,
			},
			plugins: ['jest'],
		},

		{
			files: ['*.ts'],
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
			extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
			rules: {
				...defaultRules,
				'vue/multi-word-component-names': 'off',
				// It's recommended to turn off this rule on TypeScript projects
				'no-undef': 'off',
				// Allow ts-directive comments (used to suppress TypeScript compiler errors)
				'@typescript-eslint/ban-ts-comment': 'off',
				// Allow usage of the any type (consider to enable this rule later on)
				'@typescript-eslint/no-explicit-any': 'off',
				// Allow usage of require statements (consider to enable this rule later on)
				'@typescript-eslint/no-var-requires': 'off',
				// Allow non-null assertions for now (consider to enable this rule later on)
				'@typescript-eslint/no-non-null-assertion': 'off',
				// Allow unused arguments and variables when they begin with an underscore
				'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			},
		},
	],
};
