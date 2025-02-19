const rulesDirPlugin = require('eslint-plugin-rulesdir');
rulesDirPlugin.RULES_DIR = 'build/rules';

module.exports = {
    'extends': [
        'devextreme/spell-check'
    ],
    'root': true,
    'parserOptions': {
        'createDefaultProgram': true,
        'project': './tsconfig.json',
        'ecmaVersion': 6,
        'sourceType': 'module',
        'ecmaFeatures': {
            'globalReturn': true,
            'jsx': true
        }
    },
    plugins: [
        'rulesdir'
    ],
    'overrides': [
        {
            'files': [
                '*.js'
            ],
            'parser': 'babel-eslint',
            'extends': [
                'eslint:recommended'
            ],
            'env': {
                'es6': true
            },
            'globals': {
                'setInterval': true,
                'setTimeout': true,
                'clearInterval': true,
                'clearTimeout': true,
                'require': true,
                'module': true,
                'exports': true
            },
            'rules': {
                'block-spacing': 'error',
                'comma-spacing': 'error',
                'computed-property-spacing': 'error',
                'comma-style': [
                    'error',
                    'last'
                ],
                'eqeqeq': [
                    'error',
                    'allow-null'
                ],
                'strict': 'error',
                'func-call-spacing': 'error',
                'key-spacing': 'error',
                'keyword-spacing': [
                    'error',
                    {
                        'overrides': {
                            'catch': {
                                'after': false
                            },
                            'for': {
                                'after': false
                            },
                            'if': {
                                'after': false
                            },
                            'switch': {
                                'after': false
                            },
                            'while': {
                                'after': false
                            }
                        }
                    }
                ],
                'no-multiple-empty-lines': [
                    'error',
                    {
                        'max': 2
                    }
                ],
                'no-multi-spaces': 'error',
                'no-trailing-spaces': 'error',
                'no-empty': [
                    'error',
                    {
                        'allowEmptyCatch': true
                    }
                ],
                'no-new-func': 'error',
                'no-eval': 'error',
                'no-undef-init': 'error',
                'no-unused-vars': [
                    'error',
                    {
                        'args': 'none',
                        'ignoreRestSiblings': true
                    }
                ],
                'no-extend-native': 'error',
                'no-alert': 'error',
                'no-console': 'error',
                'no-restricted-syntax': [
                    'error',
                    'ForOfStatement'
                ],
                'no-var': 'error',
                'no-whitespace-before-property': 'error',
                'object-curly-spacing': [
                    'error',
                    'always'
                ],
                'one-var': [
                    'error',
                    'never'
                ],
                'prefer-const': 'error',
                'semi-spacing': 'error',
                'semi': 'error',
                'space-before-blocks': 'error',
                'space-before-function-paren': [
                    'error',
                    'never'
                ],
                'space-in-parens': 'error',
                'space-infix-ops': 'error',
                'space-unary-ops': 'error',
                'spaced-comment': [
                    'error',
                    'always',
                    {
                        'exceptions': [
                            '#DEBUG',
                            '#ENDDEBUG'
                        ],
                        'markers': [
                            '/'
                        ]
                    }
                ],
                'brace-style': [
                    'error',
                    '1tbs',
                    {
                        'allowSingleLine': true
                    }
                ],
                'curly': [
                    'error',
                    'multi-line',
                    'consistent'
                ],
                'unicode-bom': [
                    'error',
                    'never'
                ],
                'eol-last': [
                    'error',
                    'always'
                ],
                'indent': [
                    'error',
                    4,
                    {
                        'SwitchCase': 1,
                        'MemberExpression': 1,
                        'CallExpression': {
                            'arguments': 1
                        }
                    }
                ],
                'quotes': [
                    'error',
                    'single'
                ],
                'import/named': 2,
                'import/default': 2,
                'import/no-duplicates': 2
            }
        },
        {
            'files': [
                '*.ts?(x)'
            ],
            'parser': '@typescript-eslint/parser',
            'extends': [
                'devextreme/typescript'
            ],
            'rules': {
                '@typescript-eslint/adjacent-overload-signatures': 'error',
                '@typescript-eslint/array-type': 'error',
                '@typescript-eslint/await-thenable': 'error',
                '@typescript-eslint/ban-ts-comment': 'error',
                '@typescript-eslint/ban-types': 'error',
                'brace-style': 'off',
                '@typescript-eslint/brace-style': 'error',
                '@typescript-eslint/class-literal-property-style': 'error',
                'comma-spacing': 'off',
                '@typescript-eslint/comma-spacing': 'error',
                '@typescript-eslint/consistent-type-assertions': 'error',
                '@typescript-eslint/consistent-type-definitions': 'error',
                'default-param-last': 'off',
                '@typescript-eslint/default-param-last': 'error',
                'dot-notation': 'off',
                '@typescript-eslint/dot-notation': 'error',
                '@typescript-eslint/explicit-function-return-type': 'error',
                'func-call-spacing': 'off',
                '@typescript-eslint/func-call-spacing': 'error',
                'indent': 'off',
                '@typescript-eslint/indent': 'error',
                'init-declarations': 'off',
                'keyword-spacing': 'off',
                '@typescript-eslint/keyword-spacing': 'error',
                'lines-between-class-members': 'off',
                '@typescript-eslint/lines-between-class-members': 'error',
                '@typescript-eslint/member-delimiter-style': 'error',
                '@typescript-eslint/method-signature-style': 'error',
                '@typescript-eslint/naming-convention': 'error',
                'no-array-constructor': 'off',
                '@typescript-eslint/no-array-constructor': 'error',
                'no-dupe-class-members': 'off',
                '@typescript-eslint/no-dupe-class-members': 'error',
                'no-empty-function': 'off',
                '@typescript-eslint/no-empty-function': 'error',
                '@typescript-eslint/no-empty-interface': [
                    'error',
                    {
                        'allowSingleExtends': true
                    }
                ],
                '@typescript-eslint/no-extra-non-null-assertion': 'error',
                'no-extra-parens': 'off',
                '@typescript-eslint/no-extra-parens': 'error',
                'no-extra-semi': 'off',
                '@typescript-eslint/no-extra-semi': 'error',
                '@typescript-eslint/no-for-in-array': 'error',
                '@typescript-eslint/no-implied-eval': 'error',
                '@typescript-eslint/no-inferrable-types': 'error',
                'no-invalid-this': 'off',
                'no-magic-numbers': 'off',
                '@typescript-eslint/no-misused-new': 'error',
                '@typescript-eslint/no-namespace': 'error',
                '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
                '@typescript-eslint/no-parameter-properties': 'error',
                '@typescript-eslint/no-require-imports': 'error',
                '@typescript-eslint/no-this-alias': 'error',
                '@typescript-eslint/no-throw-literal': 'error',
                '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
                '@typescript-eslint/no-unnecessary-qualifier': 'error',
                '@typescript-eslint/no-unnecessary-type-arguments': 'error',
                'no-unused-expressions': 'off',
                '@typescript-eslint/no-unused-expressions': 'error',
                'no-unused-vars': 'off',
                '@typescript-eslint/no-unused-vars': 'error',
                'no-use-before-define': 'off',
                '@typescript-eslint/no-use-before-define': 'error',
                'no-useless-constructor': 'off',
                '@typescript-eslint/no-useless-constructor': 'error',
                '@typescript-eslint/no-var-requires': 'error',
                '@typescript-eslint/prefer-as-const': 'error',
                '@typescript-eslint/prefer-for-of': 'error',
                '@typescript-eslint/prefer-function-type': 'error',
                '@typescript-eslint/prefer-namespace-keyword': 'error',
                '@typescript-eslint/prefer-optional-chain': 'error',
                '@typescript-eslint/prefer-readonly': 'error',
                '@typescript-eslint/prefer-reduce-type-parameter': 'error',
                '@typescript-eslint/prefer-regexp-exec': 'error',
                '@typescript-eslint/prefer-string-starts-ends-with': 'error',
                '@typescript-eslint/prefer-ts-expect-error': 'error',
                'quotes': 'off',
                '@typescript-eslint/quotes': 'error',
                'require-await': 'off',
                'semi': 'off',
                '@typescript-eslint/semi': 'error',
                'space-before-function-paren': 'off',
                '@typescript-eslint/space-before-function-paren': 'error',
                '@typescript-eslint/switch-exhaustiveness-check': 'error',
                '@typescript-eslint/triple-slash-reference': 'error',
                '@typescript-eslint/type-annotation-spacing': 'error',
                '@typescript-eslint/unified-signatures': 'error',
                '@typescript-eslint/no-type-alias': [
                    'error',
                    {
                        'allowAliases': 'in-unions-and-intersections',
                        'allowCallbacks': 'always'
                    }
                ],
                'no-undef-init': 0,
                '@typescript-eslint/no-extraneous-class': 'error',
                '@typescript-eslint/no-dynamic-delete': 'error',
                '@typescript-eslint/no-base-to-string': 'error',
                '@typescript-eslint/no-unused-vars-experimental': 'error',
                '@typescript-eslint/init-declarations': 'error',
                '@typescript-eslint/member-ordering': 'error',
                '@typescript-eslint/return-await': 'error',
                '@typescript-eslint/no-invalid-void-type': 'error',
                '@typescript-eslint/typedef': 'error',
                '@typescript-eslint/no-invalid-this': 'error',
                '@typescript-eslint/prefer-includes': 'error',
                '@typescript-eslint/no-unnecessary-type-assertion': 'error',
                '@typescript-eslint/prefer-nullish-coalescing': 'error',
                '@typescript-eslint/no-explicit-any': 'error',
                '@typescript-eslint/explicit-module-boundary-types': 'error',
                '@typescript-eslint/require-array-sort-compare': [
                    'error',
                    {
                        'ignoreStringArrays': true
                    }
                ],
                '@typescript-eslint/restrict-plus-operands': [
                    'error',
                    {
                        'checkCompoundAssignments': true
                    }
                ],
                '@typescript-eslint/require-await': 'error',
                'no-return-await': 'off',
                '@typescript-eslint/no-misused-promises': 'error',
                '@typescript-eslint/no-floating-promises': 'error',
                '@typescript-eslint/no-unsafe-return': 'error',
                'rulesdir/no-non-null-assertion': 'error',
                '@typescript-eslint/no-unsafe-member-access': 'warn',
                '@typescript-eslint/no-non-null-assertion': 'off'
                /*
            "@typescript-eslint/no-magic-numbers": "error",
            "no-return-await": "off",
            "@typescript-eslint/no-unsafe-assignment": "error",
            "@typescript-eslint/restrict-template-expressions": "error",
            "@typescript-eslint/no-unsafe-call": "error",
            "@typescript-eslint/no-unnecessary-condition": "error",
            "@typescript-eslint/strict-boolean-expressions": "error",
            "@typescript-eslint/unbound-method": "error",
            */
            }
        },
        {
            'files': [
                './js/**/*.js'
            ],
            'rules': {
                'import/no-commonjs': 'error'
            }
        }
    ]
};
