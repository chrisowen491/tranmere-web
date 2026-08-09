import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['.wrangler/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended
];
