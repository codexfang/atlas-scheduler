import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync } from 'node:fs'
import { join } from 'node:path'

/** Copy index.html → 404.html for GitHub Pages SPA fallback */
function ghPagesSpaFallback() {
  return {
    name: 'gh-pages-spa-fallback',
    closeBundle() {
      copyFileSync(join('dist', 'index.html'), join('dist', '404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/atlas-scheduler/',
  plugins: [react(), tailwindcss(), ghPagesSpaFallback()],
})
