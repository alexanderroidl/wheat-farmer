module.exports = {
  ignorePatterns: ["build/**/*.js"],
  parser: "@typescript-eslint/parser",
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
        "@typescript-eslint/semi": ["error"],
        "@typescript-eslint/type-annotation-spacing": ["error"],
        "@typescript-eslint/member-ordering": "error",
        "@typescript-eslint/adjacent-overload-signatures": "off"
      },
      env: {
        browser: true
      }
    }
  ]
};