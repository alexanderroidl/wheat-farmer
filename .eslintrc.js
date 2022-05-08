module.exports = {
  extends: ["eslint:recommended"],
  rules: {
    "brace-style": ["error", "1tbs"],
    "callback-return": "off",
    "camelcase": ["error", { "properties": "always" }],
    "capitalized-comments": ["off", "always"],
    "comma-dangle": ["error", "never"],
    "comma-spacing": ["error", { "before": false, "after": true }],
    "eqeqeq": ["error", "always", { "null": "ignore" }],
    "func-call-spacing": ["error", "never"],
    "indent": ["error", 2],
    "key-spacing": ["error", { "beforeColon": false }],
    "keyword-spacing": ["error", { "before": true }],
    "lines-around-comment": ["error", {
      "allowObjectStart": true,
      "allowClassStart": true,
      "beforeBlockComment": true
    }],
    "max-params": ["error", 4],
    "no-empty": ["error"],
    "no-empty-character-class": "off",
    "no-empty-function": ["error"],
    "no-extra-semi": ["error"],
    "no-mixed-spaces-and-tabs": ["error"],
    "no-multi-spaces": ["error", { "ignoreEOLComments": true }],
    "no-multiple-empty-lines": ["error"],
    "no-shadow-restricted-names": ["error"],
    "no-trailing-spaces": ["error", { "skipBlankLines": false }],
    "no-unused-vars": ["error", {
      "vars": "all",
      "args": "none",
      "argsIgnorePattern": "^_",
      "ignoreRestSiblings": false
    }],
    "no-inferrable-types": "off",
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
    "spaced-comment": ["error", "always"],
    "switch-colon-spacing": ["error", { "before": false, "after": true }],
    "template-tag-spacing": ["error", "always"]
  },
  parserOptions: {
    ecmaVersion: 2017
  },
  env: {
    node: true,
    es6: true
  },
  overrides: [
    {
      files: "**/*.spec.js",
      env: {
        mocha: true
      }
    }
  ]
};