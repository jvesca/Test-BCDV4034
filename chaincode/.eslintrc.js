module.exports = {
    env: {
        node: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:node/recommended-module',
    ],
    parserOptions: {
        ecmaVersion: 12,
    },
    rules: {
        'no-console': 'off',
        'node/no-unpublished-require': 'off',
    },
    plugins: [
        'node',
    ],
};
