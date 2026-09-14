import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isSandbox = (env.VITE_CASHFREE_ENV || 'production').toLowerCase() === 'sandbox';
  const cashfreeTarget = isSandbox ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      proxy: {
        '/api/cashfree': {
          target: cashfreeTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cashfree/, ''),
        },
      },
    },
  };
})

