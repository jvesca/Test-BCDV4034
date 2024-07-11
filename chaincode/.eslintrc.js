module.exports = {
    env: {
        node: true,
        es2021: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:node/recommended',
        'plugin:jest/recommended', // If using Jest
    ],
    parserOptions: {
        ecmaVersion: 12,
    },
    rules: {
        'no-console': 'off', // Optional: Allows console usage
        'node/no-unpublished-require': 'off', // Optional: Allows require statements for non-published modules
        // 'no-unused-vars': ['error', { 'varsIgnorePattern': 'allocationObjType'}], // Ignore specific unused variable

    },
    overrides: [
        {
            files: ['tests/**/*.js'], // Specify files to apply different rules (like for test files)
            rules: {
                'jest/no-undef': 'off', // Optional: Disables Jest undefined rule for test files
            },
        },
    ],
    plugins: [
        'jest', // If using Jest
    ],
};
