import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '**/*.config.js',
      '**/node_modules/**',
      '**/.next/**',
      '**/.vercel/**',
      '**/.wrangler/**',
      '**/public/graphs/**'
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
    }
  }
];

