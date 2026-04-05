import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Split vendor chunks for faster loads
    rollupOptions: {
      output: {
        manualChunks: {
          react:  ['react', 'react-dom'],
          idb:    ['idb'],
        },
      },
    },
    // Smaller output
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
