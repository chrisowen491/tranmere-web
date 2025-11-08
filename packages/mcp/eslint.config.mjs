import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '**/*.config.js',
      '**/assets/**',
      '**/.wrangler/**',
      '**/node_modules/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
{
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-empty-pattern': 'off',
    }
  }
];

