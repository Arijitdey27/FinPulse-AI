import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('/d3-') || id.includes('\\d3-')) {
            return 'charts-d3'
          }

          if (
            id.includes('recharts/es6/chart') ||
            id.includes('recharts\\es6\\chart')
          ) {
            return 'charts-core'
          }

          if (
            id.includes('recharts/es6/cartesian') ||
            id.includes('recharts\\es6\\cartesian') ||
            id.includes('recharts/es6/component') ||
            id.includes('recharts\\es6\\component')
          ) {
            return 'charts-components'
          }

          if (
            id.includes('recharts/es6/shape') ||
            id.includes('recharts\\es6\\shape')
          ) {
            return 'charts-shapes'
          }

          if (
            id.includes('recharts/es6/util') ||
            id.includes('recharts\\es6\\util') ||
            id.includes('recharts/es6/state') ||
            id.includes('recharts\\es6\\state') ||
            id.includes('recharts/es6/context') ||
            id.includes('recharts\\es6\\context')
          ) {
            return 'charts-utils'
          }

          if (id.includes('recharts')) {
            return 'charts'
          }

          if (id.includes('lucide-react')) {
            return 'icons'
          }

          if (id.includes('react-router-dom')) {
            return 'router'
          }

          if (
            id.includes('axios') ||
            id.includes('react') ||
            id.includes('react-dom')
          ) {
            return 'vendor'
          }

          return undefined
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
})
