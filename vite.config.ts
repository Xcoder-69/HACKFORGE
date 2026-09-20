import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { apiServerPlugin } from './server/apiPlugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiServerPlugin()],
})
