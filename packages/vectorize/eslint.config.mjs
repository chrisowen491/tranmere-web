import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '**/*.config.js',
      '**/.wrangler/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
];

