// Import necessary dependencies
const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");

module.exports = [
  {
    // Lint all .ts, .tsx, .js, .jsx files
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    ignores: ["node_modules/**", "dist/**", "build/**", ".env"],
    languageOptions: {
      ecmaVersion: "latest", // Specify ECMAScript version
      sourceType: "module", // Set module source type
      parser: tsParser, // Use TypeScript parser
    },
    plugins: {
      "@typescript-eslint": typescriptEslint, // Register TypeScript ESLint plugin
    },
    rules: {
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-explicit-any": "off",
      indent: ["error", 2], // Use 2 spaces for indentation
      quotes: ["error", "double"], // Enforce double quotes
      semi: ["error", "always"], // Enforce semicolons
    },
  },
  {
    // Jest-specific overrides for test files
    files: ["**/__tests__/*.ts", "**/*.spec.ts"],
    languageOptions: {
      globals: {
        jest: true,
      },
    },
  },
];
