import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  // Vite so expoe VITE_* ao client por padrao; o projeto usa o prefixo PUBLIC_
  envPrefix: ['VITE_', 'PUBLIC_'],
  server: {
    host: true,
    port: 5173,
  },
})
