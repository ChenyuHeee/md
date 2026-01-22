import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import monaco from 'vite-plugin-monaco-editor';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  base: '/md/',
  plugins: [
    react(),
    // Ensures Monaco workers bundle correctly in Vite.
    // Keep languages limited for size.
    // vite-plugin-monaco-editor exports an object; the actual plugin function is `.default`.
    // @ts-expect-error - plugin typings vary between versions
    monaco.default({
      languageWorkers: ['editorWorkerService', 'typescript', 'json', 'css', 'html'],
    }),
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
