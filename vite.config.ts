import fs from 'node:fs'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import electron from 'vite-plugin-electron/simple'

import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig(({command}) => {
  let isServe = command === 'serve'
  let isBuild = command === 'build'
  let sourcemap = isServe || !!process.env.VSCODE_DEBUG
  let url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL)

  fs.rmSync('dist-electron', {recursive: true, force: true})

  return {
    server: {
      host: url.hostname,
      port: +url.port
    },
    clearScreen: false,
    plugins: [
      vue(),
      vueJsx(),
      electron({
        main: {
          entry: 'electron/main/index.ts',
          onstart({startup}) {
            if (process.env.VSCODE_DEBUG) {
              console.log('[startup] Electron App')
            } else {
              startup().then()
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: [...Object.keys(pkg['dependencies'] || {})]
              }
            }
          }
        },
        preload: {
          input: 'electron/preload/index.ts',
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined,
              minify: isBuild,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys(pkg['dependencies'] || {})
              }
            }
          }
        },
        renderer: {}
      })
    ]
  }
})
