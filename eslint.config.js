import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

/**
 * ESLint Configuration
 * 
 * Includes standard React/TS rules + Security rules
 */
export default tseslint.config(
  { ignores: ["dist", "node_modules", "*.config.js"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Base rules
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      
      // ===================================
      // SECURITY RULES
      // ===================================
      
      // Prevent console.log in production code
      "no-console": [
        "error",
        {
          allow: ["warn", "error"],
        },
      ],
      
      // Prevent eval and similar dangerous functions
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      
      // Prevent dangerous global references
      "no-restricted-globals": [
        "error",
        {
          name: "eval",
          message: "eval() is dangerous and should never be used.",
        },
      ],
      
      // Prevent dangerous properties
      "no-restricted-properties": [
        "error",
        {
          object: "document",
          property: "write",
          message: "document.write() is dangerous and can cause XSS.",
        },
        {
          object: "window",
          property: "eval",
          message: "window.eval() is dangerous and should never be used.",
        },
      ],
      
      // Prevent unused variables (can hide bugs)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      
      // Prevent any type (can hide type errors)
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Require explicit return types for functions
      "@typescript-eslint/explicit-function-return-type": [
        "off", // Off by default, but recommended for critical functions
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      
      // Prevent non-null assertions (can cause runtime errors)
      "@typescript-eslint/no-non-null-assertion": "warn",
      
      // Best practices
      "eqeqeq": ["error", "always"], // Require === and !==
      "no-var": "error", // Require let or const
      "prefer-const": "error", // Prefer const when variable is not reassigned
      "no-return-await": "error", // Disallow unnecessary return await
      
      // Prevent common mistakes
      "no-unreachable": "error",
      "no-fallthrough": "error",
      "no-duplicate-case": "error",
      
      // TypeScript specific
      "@typescript-eslint/no-floating-promises": "off", // Consider enabling with proper async handling
      "@typescript-eslint/no-misused-promises": "off", // Consider enabling
      
      // React specific security
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  }
);
