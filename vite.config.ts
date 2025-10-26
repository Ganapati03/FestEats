import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.VITE_API_URL || 'https://festeats12.onrender.com'

  return defineConfig({
    base: '/festeats-app/',  // ⚠️ Replace with your GitHub repo name (e.g., '/festeats-app/')
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: backend,
          changeOrigin: true,
          secure: true
        }
      }
    },
  })
}
