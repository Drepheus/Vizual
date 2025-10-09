import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Changed from '/Omi-AI-1/' for Vercel deployment
  server: {
    port: 5175,
    strictPort: true, // Fail if port 5175 is already in use
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  // Explicitly define env prefix (default is VITE_)
  envPrefix: 'VITE_'
})