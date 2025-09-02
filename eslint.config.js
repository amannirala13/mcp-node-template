// eslint.config.js
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  { ignores: ["dist/**", "coverage/**"] },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module", project: false }
    },
    plugins: { "@typescript-eslint": tsPlugin, import: {} },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "import/order": ["error", { "newlines-between": "always" }],
      "no-console": ["warn", { allow: ["warn", "error"] }]
    }
  }
];