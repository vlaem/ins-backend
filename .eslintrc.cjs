/* eslint-env node */
module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    "rules": {
        "prettier/prettier": [
            "error",
            {
                "usePrettierrc": true
            }
        ],
        "no-unused-vars": [
            "error",
            {
                "args": "none"
            }
        ],
        "no-console": 2,
        "no-irregular-whitespace": 2,
        "no-undef": 0,
        "padded-blocks": [
            "warn",
            {
                "blocks": "never",
                "classes": "never",
                "switches": "never"
            }
        ],
        "padding-line-between-statements": [
            "warn",
            {
                "blankLine": "always",
                "prev": "*",
                "next": "block"
            },
            {
                "blankLine": "always",
                "prev": "block",
                "next": "*"
            },
            {
                "blankLine": "always",
                "prev": "*",
                "next": "block-like"
            },
            {
                "blankLine": "always",
                "prev": "block-like",
                "next": "*"
            }
        ],
        "prefer-const": [
            "warn",
            {
                "destructuring": "all"
            }
        ]
    },
    "plugins": [
        "prettier"
    ]
};