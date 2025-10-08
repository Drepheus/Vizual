import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Omi-AI-1/', // Replace with your repository name
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})