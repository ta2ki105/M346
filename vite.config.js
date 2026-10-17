import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `--mode private` builds the offline private edition (see
// scripts/build-private.mjs): one JS bundle, everything inlined, separate
// output folder that is gitignored.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build:
    mode === 'private'
      ? {
          outDir: 'dist-private',
          emptyOutDir: true,
          assetsInlineLimit: 100_000_000,
          cssCodeSplit: false,
          chunkSizeWarningLimit: 5000,
          rollupOptions: { output: { inlineDynamicImports: true } },
        }
      : {},
}));
