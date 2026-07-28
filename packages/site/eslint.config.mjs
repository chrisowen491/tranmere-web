import eslint from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';

const typescriptRecommendedRules = Object.assign(
  {},
  ...tseslint.configs.recommended.map((config) => config.rules ?? {}),
);

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
      '**/dist/**',
    ],
  },
  eslint.configs.recommended,
  ...nextVitals,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      ...typescriptRecommendedRules,
      '@typescript-eslint/no-explicit-any': 'off',
      'no-useless-assignment': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];
