module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended'],
  overrides: [
    // typescript
    {
      files: ['*.ts', '*.tsx'],
      excludedFiles: ['*.test.js', 'gatsby-node.js', 'gatsby-config.js'],
      plugins: ['@typescript-eslint'],
      extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
      ],
      rules: {
        "brace-style": ["error", "1tbs"],
        "callback-return": 0,
        "camelcase": ["error", {
            "properties": "always"
        }],
        "capitalized-comments": ["error", "always"],
        "eqeqeq": ["error", "always", {
          "null": "ignore"
        }],
        "func-call-spacing": ["error", "never"],
        "indent": ["error", 2],
        "key-spacing": ["error", {
          "beforeColon": false 
        }],
        "keyword-spacing": ["error", {
            "before": true
        }],
        "lines-around-comment": ["error", { 
          "beforeBlockComment": true 
        }],
        "max-params": ["error", 4],
        "no-empty": ["error"],
        "no-empty-character-class": 0,
        "no-empty-function": ["error"],
        "no-extra-semi": ["error"],
        "no-mixed-spaces-and-tabs": ["error"],
        "no-multi-spaces": ["error",{
          "ignoreEOLComments": true
        }],
        "no-multiple-empty-lines": ["error"],
        "no-shadow-restricted-names": ["error"],
        "no-trailing-spaces": ["error", {
          "skipBlankLines": true 
        }],
        "no-unused-vars": ["error", {
          "vars": "all", 
          "args": "none",
          "argsIgnorePattern": "^_",
          "ignoreRestSiblings": false 
        }],
        "@typescript-eslint/no-unused-vars": 0,
        "no-inferrable-types": "off",
        "@typescript-eslint/no-inferrable-types": 0,
        "one-var": ["error", "never"],
        "one-var-declaration-per-line": ["error", "always"],
        "padded-blocks": ["error", "never"],
        "padding-line-between-statements": ["error", { 
            "blankLine": "always", 
            "prev": "*", 
            "next": "block" 
        }],
        "quotes": ["error", "double", { "avoidEscape": true }],
        "semi": ["error", "always"],
        "semi-spacing": ["error"],
        "space-before-blocks": ["error", "always"],
        "space-before-function-paren": ["error", "always"],
        "space-infix-ops": ["error"],
        "space-unary-ops": ["error"],
        "switch-colon-spacing": ["error", {
            "after": true,
            "before": false
        }],
        "template-tag-spacing": ["error", "always"],
      }, 
      env: {
        browser: true
      }
    },

    // Gulp and eslint config files
    {
      files: [
        '.eslintrc.js',
        './gulpfile.js',
        './index.js'
      ],
      rules: {
        "no-unused-vars": ["error", {
          "vars": "all", 
          "args": "none",
          "argsIgnorePattern": "^_",
          "ignoreRestSiblings": false 
        }]
      },
      env: {
        node: true
      }
    }
  ]
};