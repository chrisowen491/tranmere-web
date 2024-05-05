
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';



export default tseslint.config(
  {
    // config with just ignores is the replacement for `.eslintignore`
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
      '**/tranmere-web/**',
      '**/build/**',
      '**/wip/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);

