module.exports = {
	root: true,
	env: {
		node: true
	},
	'extends': [
		'plugin:vue/essential',
		'eslint:recommended'
	],
	rules: {
		'no-console': "off",
		'no-debugger': "off"
	},
	parserOptions: {
		parser: 'babel-eslint'
	},
	'globals': {
		cyberplayer: true
	},
	overrides: [{
		files: [
			'**/__tests__/*.{j,t}s?(x)'
		],
		env: {
			mocha: true
		}
	}]
}
