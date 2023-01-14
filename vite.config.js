import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  base: "/faceout/",
  server: { https: true},
  plugins: [ mkcert() ]
})