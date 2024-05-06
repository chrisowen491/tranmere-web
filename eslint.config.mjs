
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from "globals";
import html from "@html-eslint/eslint-plugin";
import parser from "@html-eslint/parser";

export default tseslint.config(
  {
    ignores: [
      '**/*.config.js',
      '**/tag.js',
      '**/lib/tranmere-web-plugin.js',
      '**/lib/contentful.d.ts',
      '**/lib/modernizr.js',
      '**/lambda/upload.js',
      '**/node_modules/**',
      '**/local.out/**',
      '**/test/**',
      '**/csv/**',
      '**/web.out/**',
      '**/cdk.out/**',
      '**/guidebook/**',
      '**/api_tests/**',
      '**/.wrangler/**',
      '**/build/**',
      '**/wip/**',
    ],
  },
  {
    languageOptions: {
      globals: {
        $owl: true,
        d3: true,
        ...globals.jquery,
        ...globals.browser,
      },
    },
  },
  html.configs["flat/recommended"],
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);

