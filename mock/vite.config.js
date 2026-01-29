import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/mock/',
  plugins: [react()],
  build: {
    outDir: '../apps/web/out/mock',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: true
  }
})
