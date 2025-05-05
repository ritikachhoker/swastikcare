import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build : {
    outDir: 'dist', // This is the default output directory for Vite
},
  plugins: [react()],
  server:{port:5173}
})

