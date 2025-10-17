import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración de Vite con plugin de React y base configurable para GH Pages
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: { port: 5174 },
    preview: { port: 5174 },
    base: env.VITE_PUBLIC_BASE || '/',
  }
})