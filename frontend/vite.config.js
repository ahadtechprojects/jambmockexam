import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/jambmockexam/', // exact match for GitHub repo name
  plugins: [react()],
})
