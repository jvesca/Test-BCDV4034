module.exports = {
    env: {
        node: true,          //  code runs in a Node.js environment
        es2021: true,        //  using ECMAScript 2021 features
        jest: true,          //  using Jest for testing
    },
    extends: [
        'eslint:recommended',          // Use recommended ESLint rules
        'plugin:node/recommended',     // Use recommended rules for Node.js
        'plugin:jest/recommended',     // Use recommended rules for Jest
    ],
    parserOptions: {
        ecmaVersion: 12,     // Use ECMAScript 2021 syntax
    },
    rules: {
        'no-console': 'off', // Allow console.log statements
        'node/no-unpublished-require': 'off', // Allow require statements for non-published modules
    },
    overrides: [
        {
            files: ['tests/**/*.js'], // Specific rules for test files
            rules: {
                'jest/no-undef': 'off', // Disable Jest undefined rule for test files
            },
        },
    ],
    plugins: [
        'jest', // Jest plugin
    ],
};
