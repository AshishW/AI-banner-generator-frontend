import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()]
  // base: '/AI-banner-generator-frontend/', // important for GitHub Pages
  // build: {
  //   outDir: 'dist', // Default output folder, can be changed
  // },
});
