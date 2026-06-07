import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const src = (p) => fileURLToPath(new URL(`src/${p}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@quizparty/shared': fileURLToPath(
        new URL('../../packages/shared/src/index.ts', import.meta.url),
      ),
      '@app': src('app'),
      '@pages': src('pages'),
      '@widgets': src('widgets'),
      '@features': src('features'),
      '@entities': src('entities'),
      '@shared': src('shared'),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](react|react-dom)[\\/]/.test(id)) {
            return 'vendor-react';
          }
          if (
            /[\\/]node_modules[\\/](@tanstack|react-router|axios|zustand|react-hook-form)/.test(id)
          ) {
            return 'vendor-libs';
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
    },
  },
});
