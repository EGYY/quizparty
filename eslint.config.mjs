import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/*.tsbuildinfo',
      'apps/tv/android/**',
      'apps/tv/ios/**',
      'apps/tv/vendor/**',
      'docs/design/generated/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...js.configs.recommended,
  },
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowBoolean: true,
          allowNullish: true,
          allowNumber: true,
        },
      ],
    },
  },
  {
    files: ['apps/backend/prisma/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  // ── apps/backend: возврат no-explicit-any (касты на границе shared↔Prisma
  //    enum вынесены в типизированный маппер apps/backend/src/database/prisma-enums.ts).
  {
    files: ['apps/backend/src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['apps/tv/**/*.js', 'scripts/**/*.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
      },
    },
  },
  {
    files: ['apps/tv/src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./apps/tv/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // ── apps/web: типизация по собственному tsconfig (резолвит alias @shared/* и
  //    т.д., совпадает с `tsc -p apps/web/tsconfig.json`), возврат no-explicit-any
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./apps/web/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  // ── Границы слоёв FSD: слой не импортирует вышестоящие слои ────────────────
  {
    files: ['apps/web/src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@app/*', '@pages/*', '@widgets/*', '@features/*', '@entities/*'],
              message: 'FSD: слой shared не импортирует вышестоящие слои.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/web/src/entities/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@app/*', '@pages/*', '@widgets/*', '@features/*'],
              message: 'FSD: слой entities не импортирует вышестоящие слои.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/web/src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@app/*', '@pages/*', '@widgets/*'],
              message: 'FSD: слой features не импортирует вышестоящие слои.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/web/src/widgets/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@app/*', '@pages/*'],
              message: 'FSD: слой widgets не импортирует вышестоящие слои.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/web/src/pages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@app/*'],
              message: 'FSD: слой pages не импортирует слой app.',
            },
          ],
        },
      ],
    },
  },
);
