import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'ES2020',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-data': ['@tanstack/react-query', 'zustand', 'axios'],
          'vendor-maplibre': ['maplibre-gl'],
          'vendor-recharts': ['recharts'],
          'vendor-d3': ['d3-selection', 'd3-force', 'd3-zoom', 'd3-drag'],
          'vendor-three': ['three'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
