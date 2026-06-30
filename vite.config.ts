import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Generate source maps only for non-production builds
      sourcemap: false,
      // Default is 'esnext' already, but be explicit for older mobile browsers
      target: 'es2020',
      // Smaller assets inline (4 KB threshold — anything smaller becomes a data URI,
      // saving a network roundtrip)
      assetsInlineLimit: 4096,
      // CSS code-split per chunk
      cssCodeSplit: true,
      // Tree-shaking with esbuild minifier (default — but explicit)
      minify: 'esbuild' as const,
      rollupOptions: {
        output: {
          // Split vendor bundles so cache survives app code changes.
          // Each entry below becomes a separate file loaded in parallel.
          manualChunks: {
            // React core — stable, almost never changes between deploys
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // i18n — also stable
            'i18n-vendor': ['i18next', 'react-i18next'],
            // Three.js + react-three-fiber + drei — large (~600 KB), only used
            // by the UltraformerIII page. Splitting it lets the homepage load
            // without paying the WebGL tax.
            'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
            // Animation libs — used across many components
            'animation-vendor': ['framer-motion', 'motion'],
            // Other UI deps
            'ui-vendor': ['lucide-react', 'clsx', 'tailwind-merge', 'zustand'],
          },
        },
      },
    },
  };
});
