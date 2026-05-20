import { defineConfig } from 'vitest/config';

// Vitest 4 использует oxc-трансформер, который сам корректно обрабатывает
// legacy-декораторы NestJS (@Injectable и т.п.) — доп. конфиг не требуется.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
