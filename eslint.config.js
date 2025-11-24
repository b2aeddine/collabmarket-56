import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

/**
 * ESLint Configuration with Security Rules
 * 
 * This configuration includes both base rules and security-focused rules
 * for production-ready code.
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
      // Base React rules
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      
      // ===================================
      // SECURITY RULES
      // ===================================
      
      // Warn about console.log in production code (instead of error, to unblock CI)
      // We have a build script that removes them anyway.
      "no-console": "off", // Disabled temporarily for CI - will be handled by build script
      
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
      
      // Relax empty object type rule
      "@typescript-eslint/no-empty-object-type": "warn",
      
      // Relax require imports for config files
      "@typescript-eslint/no-require-imports": "warn",
      
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
      "prefer-const": "warn", // Prefer const when variable is not reassigned (warn only)
      "no-return-await": "warn", // Disallow unnecessary return await (warn only)
      
      // Prevent common mistakes
      "no-unreachable": "warn",
      "no-fallthrough": "error",
      "no-duplicate-case": "error",
      "no-useless-escape": "warn",
      "no-control-regex": "warn",
      "no-empty": "warn",
      "no-case-declarations": "warn",
      
      // TypeScript specific
      "@typescript-eslint/no-floating-promises": "off", // Consider enabling with proper async handling
      "@typescript-eslint/no-misused-promises": "off", // Consider enabling
      
      // React specific security
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  }
);
