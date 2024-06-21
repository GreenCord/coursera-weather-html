export default [{
    'rules': {
        'brace-style': [
            `error`,
            `stroustrup`,
            {
                'allowSingleLine': true
            }
        ],
        'indent': [
            `error`,
            4,
            {
                "SwitchCase": 1,
                "VariableDeclarator": `first`,
                "MemberExpression": 1,
                "FunctionDeclaration": {
                    'parameters': `first`
                },
                "FunctionExpression": {
                    'parameters': `first`
                },
                "CallExpression": {
                    'arguments': `first`
                },
                "ArrayExpression": `first`,
                "ObjectExpression": `first`,
                "ImportDeclaration": `first`,
                'ignoreComments': true,
            }
        ],
        'linebreak-style': [
            `error`,
            `unix`
        ],
        'no-console': `off`,
        'no-extra-parens': `error`,
        'no-fallthrough': `warn`,
        'no-trailing-spaces': [
            `error`,
            {
                'skipBlankLines': false,
                'ignoreComments': false
            }
        ],
        'no-unneeded-ternary': `error`,
        'no-useless-catch': 1,
        'no-whitespace-before-property': `error`,
        'nonblock-statement-body-position': [
            `error`,
            `beside`
        ],
        'object-curly-spacing': [
            `error`,
            `always`,
            {
                'arraysInObjects': true,
                'objectsInObjects': true
            }
        ],
        'padding-line-between-statements': [
            `error`,
            {
                blankLine: `always`,
                prev: [`const`, `let`, `var`],
                next: `*`
            }, {
                blankLine: `any`,
                prev: [`const`, `let`, `var`],
                next: [`const`, `let`, `var`]
            }, {
                blankLine: `always`,
                prev: [`break`, `default`],
                next: `*`
            }
        ],
        'prefer-object-spread': `error`,
        'quotes': [
            `error`,
            `backtick`,
            {
                'avoidEscape': true,
                'allowTemplateLiterals': true
            }
        ],
        'semi': [
            `error`,
            `always`
        ]
    }
}];