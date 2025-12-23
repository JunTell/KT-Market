// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";

export default defineConfig([
  // 기본 JS 권장
  js.configs.recommended,

  // Next.js (App Router + Web Vitals)
  ...nextVitals,
  ...nextTs,

  // TypeScript 권장
  ...tseslint.configs.recommended,

  // 공통 설정
  {
    plugins: {
      "react-hooks": reactHooks,
      import: importPlugin,
    },

    rules: {
      /* ================================
         기본 품질
      ================================= */
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",

      /* ================================
         React / Hooks
      ================================= */
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      /* ================================
         TypeScript
      ================================= */
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],
      "@typescript-eslint/no-explicit-any": "off", // 실무 편의상 허용

      /* ================================
         Import / 구조 정리
      ================================= */
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "type",
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
        },
      ],

      /* ================================
         Next.js 실무 기준 완화
      ================================= */
      "@next/next/no-img-element": "off", // 상황 따라 허용
      "@next/next/no-html-link-for-pages": "off",
    },
  },

  // ESLint가 무시할 경로
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "node_modules/**",
    "next-env.d.ts",
  ]),
]);