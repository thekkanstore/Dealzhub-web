import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api/cashfree': {
        target: 'https://sandbox.cashfree.com/pg',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cashfree/, ''),
      },
    },
  },
})
