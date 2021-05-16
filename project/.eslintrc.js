module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended"],
  ignorePatterns: ["./project/build/**/*.js"],
  rules: {
    "brace-style": ["error", "1tbs"],
    "callback-return": 0,
    "camelcase": ["error", { "properties": "always" }],
    "capitalized-comments": ["error", "always"],
    "comma-dangle": ["error", "never"],
    "comma-spacing": ["error", { "before": false, "after": true }],
    "eqeqeq": ["error", "always", { "null": "ignore" }],
    "func-call-spacing": ["error", "never"],
    "indent": ["error", 2],
    "key-spacing": ["error", { "beforeColon": false }],
    "keyword-spacing": ["error", { "before": true }],
    "lines-around-comment": ["error", {
      "allowObjectStart": true,
      "beforeBlockComment": true
    }],
    "max-params": ["error", 4],
    "no-empty": ["error"],
    "no-empty-character-class": 0,
    "no-empty-function": ["error"],
    "no-extra-semi": ["error"],
    "no-mixed-spaces-and-tabs": ["error"],
    "no-multi-spaces": ["error", { "ignoreEOLComments": true }],
    "no-multiple-empty-lines": ["error"],
    "no-shadow-restricted-names": ["error"],
    "no-trailing-spaces": ["error", { "skipBlankLines": true }],
    "no-unused-vars": ["error", {
      "vars": "all",
      "args": "none",
      "argsIgnorePattern": "^_",
      "ignoreRestSiblings": false
    }],
    //"@typescript-eslint/no-unused-vars": 0,
    "no-inferrable-types": "off",
    //"@typescript-eslint/no-inferrable-types": 0,
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
    "switch-colon-spacing": ["error", { "before": false, "after": true }],
    "template-tag-spacing": ["error", "always"]
  },
  overrides: [
    // Typescript
    {
      files: ["*.ts"],
      plugins: ["@typescript-eslint"],
      extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
      ],
      rules: {
        "@typescript-eslint/explicit-member-accessibility": ["error", {
          accessibility: "explicit",
          overrides: {
            accessors: "explicit",
            constructors: "no-public",
            methods: "explicit",
            properties: "off",
            parameterProperties: "explicit"
          }
        }],
        "@typescript-eslint/naming-convention": [
          "error",
          {
            "selector": "property",
            "modifiers": ["private"],
            "format": ["camelCase"],
            "leadingUnderscore": "require"
          },

          {
            "selector": "property",
            "modifiers": ["private", "readonly"],
            "format": ["UPPER_CASE"]
          },
          
          {
            "selector": "typeLike",
            "format": ["PascalCase"]
          }
        ],
        "no-unused-vars": 0,
        "@typescript-eslint/no-unused-vars": ["error", {
          "vars": "all",
          "args": "none",
          "argsIgnorePattern": "^_",
          "ignoreRestSiblings": false
        }],
        "@typescript-eslint/no-inferrable-types": 0,
        "semi": "off",
        "@typescript-eslint/semi": ["error"]
      },
      env: {
        browser: true
      }
    },

    // Gulp and eslint config files
    {
      files: [
        ".eslintrc.js",
        "./gulpfile.js",
        "./express.js"
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