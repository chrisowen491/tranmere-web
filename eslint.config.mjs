import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from "globals";
import html from "@html-eslint/eslint-plugin";
import parser from "@html-eslint/parser";

export default [
  {
    ignores: [
      '**/*.config.js',
      '**/tag.js',
      '**/lib/tranmere-web-plugin.js',
      '**/lib/contentful.d.ts',
      '**/lib/modernizr.js',
      '**/node_modules/**',
      '**/local.out/**',
      '**/test/**',
      '**/csv/**',
      '**/cdk.out/**',
      '**/guidebook/**',
      '**/.wrangler/**',
      '**/build/**',
      '**/wip/**',
      '**/tranmere-web/assets/js/auth.js',
      '**/templates/**',
      '**/web.out/assets/scripts/**'
    ],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        $owl: true,
        d3: true,
        ...globals.jquery,
        ...globals.browser,
      },
    }
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.html"],
    plugins: {
      "@html-eslint": html,
    },
    languageOptions: {
      parser,
    },
    rules: {
      "@html-eslint/indent": "off",
      "@html-eslint/element-newline": "off",
      "@html-eslint/no-extra-spacing-attrs": "off",
      "@html-eslint/require-lang": "error",
      "@html-eslint/require-meta-description": "warn",
      "@html-eslint/require-img-alt": "error",
      "@html-eslint/require-doctype": "error",
      "@html-eslint/require-title": "error",
      "@html-eslint/no-multiple-h1": "error",
      "@html-eslint/no-duplicate-id": "error",
      "@html-eslint/require-li-container": "error",
      "@html-eslint/quotes": "error",
      "@html-eslint/no-obsolete-tags": "error",
      "@html-eslint/require-closing-tags": "error",
      "@html-eslint/no-duplicate-attrs": "error",
    },
  },
];

