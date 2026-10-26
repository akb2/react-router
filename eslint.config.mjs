import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx,mts,cts}"],
    extends: [js.configs.recommended],
    plugins: { "@stylistic": stylistic },
    languageOptions: {
      ecmaVersion: "latest",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
      "no-var": "error",
      "prefer-arrow-callback": "error",
      "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
      "@stylistic/jsx-quotes": ["error", "prefer-double"],
    },
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    extends: [tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["{backend,core}/**/*.{js,mjs,cjs,ts,mts,cts}", "**/*.config.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["frontend/**/*.{js,jsx,ts,tsx}"],
    ignores: ["**/*.config.*"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  prettier,
]);
