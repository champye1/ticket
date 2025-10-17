import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración de Vite con plugin de React
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  preview: { port: 5174 }
})