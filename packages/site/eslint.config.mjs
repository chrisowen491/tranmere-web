import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
  recommendedConfig: eslint.configs.recommended,
})

export default [
  {
    ignores: [
      '**/*.config.js',
      '**/*.config.mjs',
      '**/node_modules/**',
      '**/.next/**',
      '**/.vercel/**',
      '**/.wrangler/**',
      '**/public/graphs/**',
      '**/.open-next/**',
    ],
  },
  ...compat.config({
    extends: ['eslint:recommended', 'next'],
  }),
  ...tseslint.configs.recommended,
  {
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
    }
  }
];