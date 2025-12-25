import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- You are likely missing this line

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // Now this function is defined
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      }
    }
  }
})