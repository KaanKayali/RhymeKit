import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site at /<repo-name>/, so we need to
// set the base path accordingly. Change 'RhymeKit' if you rename
// the repository.
export default defineConfig({
  base: '/RhymeKit/',
  plugins: [react()],
})
